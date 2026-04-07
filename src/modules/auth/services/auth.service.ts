import { supabase } from '@/shared/db/supabase';
import { hashPassword, comparePassword } from '@/shared/utils/hash';
import { signToken } from '@/shared/utils/jwt';

export class AuthService {
  // 🔥 ONBOARDING FLOW
  static async register(data: any) {
    const { teamName, email, password, firstName, lastName } = data;

    // check user
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) throw new Error('User already exists');

    // create user
    const hashed = await hashPassword(password);

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashed,
          first_name: firstName,
          last_name: lastName
        }
      ])
      .select()
      .single();

    if (userError) throw userError;

    // create team (workspace)
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([
        {
          name: teamName,
          owner_id: user.id
        }
      ])
      .select()
      .single();

    if (teamError) throw teamError;

    // attach user to team as owner
    await supabase.from('team_members').insert([
      {
        team_id: team.id,
        user_id: user.id,
        role: 'owner'
      }
    ]);

    const token = signToken({
      userId: user.id,
      teamId: team.id,
      role: 'owner'
    });

    return { user, team, token };
  }

  static async login(data: any) {
    const { email, password } = data;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) throw new Error('Invalid credentials');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    // get team
    const { data: membership } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .single();

    const token = signToken({
      userId: user.id,
      teamId: membership.team_id,
      role: membership.role
    });

    return { user, token };
  }

  // 👥 Invite team member
  static async inviteMember(teamId: string, data: any) {
    const { email, role } = data;

    // find user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      throw new Error('User must register first');
    }

    await supabase.from('team_members').insert([
      {
        team_id: teamId,
        user_id: user.id,
        role
      }
    ]);

    return { message: 'User added to team' };
  }
}