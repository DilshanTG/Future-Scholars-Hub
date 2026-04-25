import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the caller is a logged-in teacher
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Admin client (service_role — server-side only)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify caller — pass the raw token to the admin client so Supabase
    // verifies it server-side (supports ES256; local verify only handles HS256)
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { data: teacher } = await supabaseAdmin
      .from('teacher_profiles').select('id').eq('id', user.id).maybeSingle()
    if (!teacher) {
      return new Response(JSON.stringify({ error: 'Only teachers can create students' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { mobile, name, grade, gender, district, description, teacher_note, avatar, password } = body

    if (!mobile || !name || !grade || !gender) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create auth user: email = mobile@fsh.internal
    const email = `${mobile}@fsh.internal`
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password ?? 'student123',
      email_confirm: true,
    })

    if (authError) {
      const msg = authError.message.toLowerCase().includes('already')
        ? 'Mobile number already registered'
        : authError.message
      return new Response(JSON.stringify({ error: msg }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Insert student profile
    const { data: student, error: insertError } = await supabaseAdmin
      .from('students')
      .insert({
        id: authData.user.id,
        mobile,
        name,
        grade,
        gender,
        district: district ?? '',
        description: description || null,
        teacher_note: teacher_note || null,
        avatar: avatar ?? '🎓',
        login_password: password ?? 'student123',
      })
      .select('id')
      .single()

    if (insertError) {
      // Roll back the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ student_id: student.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
