import { supabase } from '../lib/supabase';

export interface EmployeeRequest {
  id: string;
  user_id: string;
  team_id?: string;
  manager_id?: string;
  type: 'time_off' | 'resource' | 'equipment' | 'support' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  manager_response?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  employee_name?: string;
  employee_email?: string;
}

export interface CreateRequestData {
  type: EmployeeRequest['type'];
  title: string;
  description: string;
  priority?: EmployeeRequest['priority'];
  team_id?: string;
  manager_id?: string;
}

export const employeeRequestsService = {
  async createRequest(data: CreateRequestData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let teamId = data.team_id;
    let managerId = data.manager_id;

    if (!teamId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('assigned_team_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.assigned_team_id) {
        teamId = profile.assigned_team_id;
      } else {
        const { data: membership } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (membership) {
          teamId = membership.team_id;
        }
      }
    }

    if (!managerId && teamId) {
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'manager')
        .eq('assigned_team_id', teamId)
        .limit(1)
        .maybeSingle();

      if (managerProfile) {
        managerId = managerProfile.id;
      }
    }

    const { data: request, error } = await supabase
      .from('employee_requests')
      .insert({
        type: data.type,
        title: data.title,
        description: data.description,
        priority: data.priority || 'normal',
        team_id: teamId,
        manager_id: managerId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  async getMyRequests() {
    const { data: requests, error } = await supabase
      .from('employee_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return requests as EmployeeRequest[];
  },

  async getRequestById(id: string) {
    const { data: request, error } = await supabase
      .from('employee_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return request as EmployeeRequest;
  },

  async updateRequest(id: string, updates: Partial<CreateRequestData>) {
    const { data: request, error } = await supabase
      .from('employee_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  async deleteRequest(id: string) {
    const { error } = await supabase
      .from('employee_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTeamRequests() {
    const { data: requests, error } = await supabase
      .from('employee_requests')
      .select(`
        *,
        profiles!employee_requests_user_id_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (requests || []).map((req: any) => ({
      ...req,
      employee_name: req.profiles?.full_name || 'Unknown',
      employee_email: req.profiles?.email || '',
    })) as EmployeeRequest[];
  },

  async updateRequestStatus(
    id: string,
    status: 'approved' | 'rejected',
    managerId?: string,
    managerComment?: string
  ) {
    const { data: request, error: fetchError } = await supabase
      .from('employee_requests')
      .select('user_id, title, type')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const updates: any = {
      status,
      manager_id: managerId || (await supabase.auth.getUser()).data.user?.id,
    };

    if (managerComment) {
      updates.manager_response = managerComment;
    }

    const { data: updatedRequest, error } = await supabase
      .from('employee_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (request) {
      const { notificationsService } = await import('./notificationsService');
      const statusText = status === 'approved' ? 'approuvée' : 'refusée';
      await notificationsService.createNotification(
        request.user_id,
        `Demande ${statusText}`,
        `Votre demande "${request.title}" a été ${statusText} par votre manager.${managerComment ? ` Message: ${managerComment}` : ''}`,
        `request_${status}`,
        id
      );
    }

    return updatedRequest;
  },

  async getAllEmployeeRequests() {
    const { data: requests, error } = await supabase
      .from('employee_requests')
      .select(`
        *,
        profiles!employee_requests_user_id_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return requests || [];
  },

  async getPendingRequestsCount() {
    const { count, error } = await supabase
      .from('employee_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;
    return count || 0;
  },

  async getMyPendingRequestsCount() {
    const { count, error } = await supabase
      .from('employee_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;
    return count || 0;
  },
};
