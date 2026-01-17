import { supabase } from '../lib/supabase';
import { notificationsService } from './notificationsService';

export interface TransferRequest {
  id: string;
  user_id: string;
  from_team_id: string | null;
  to_team_id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
  from_team?: {
    name: string;
  };
  to_team?: {
    name: string;
  };
}

export const transferRequestService = {
  async createTransferRequest(
    userId: string,
    fromTeamId: string | null,
    toTeamId: string,
    message: string
  ): Promise<TransferRequest> {
    const { data, error } = await supabase
      .from('team_transfer_requests')
      .insert({
        user_id: userId,
        from_team_id: fromTeamId,
        to_team_id: toTeamId,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMyTransferRequests(userId: string): Promise<TransferRequest[]> {
    const { data, error } = await supabase
      .from('team_transfer_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transfer requests:', error);
      throw error;
    }

    if (!data) return [];

    const enrichedData = await Promise.all(
      data.map(async (request) => {
        const [profileRes, toTeamRes, fromTeamRes] = await Promise.all([
          supabase.from('profiles').select('full_name, email').eq('id', request.user_id).maybeSingle(),
          supabase.from('teams').select('name').eq('id', request.to_team_id).maybeSingle(),
          request.from_team_id
            ? supabase.from('teams').select('name').eq('id', request.from_team_id).maybeSingle()
            : Promise.resolve({ data: null, error: null })
        ]);

        return {
          ...request,
          profiles: profileRes.data,
          to_team: toTeamRes.data,
          from_team: fromTeamRes.data,
        };
      })
    );

    return enrichedData;
  },

  async getTeamTransferRequests(teamId: string): Promise<TransferRequest[]> {
    const { data, error } = await supabase
      .from('team_transfer_requests')
      .select('*')
      .eq('to_team_id', teamId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team transfer requests:', error);
      throw error;
    }

    if (!data) return [];

    const enrichedData = await Promise.all(
      data.map(async (request) => {
        const [profileRes, toTeamRes, fromTeamRes] = await Promise.all([
          supabase.from('profiles').select('full_name, email').eq('id', request.user_id).maybeSingle(),
          supabase.from('teams').select('name').eq('id', request.to_team_id).maybeSingle(),
          request.from_team_id
            ? supabase.from('teams').select('name').eq('id', request.from_team_id).maybeSingle()
            : Promise.resolve({ data: null, error: null })
        ]);

        return {
          ...request,
          profiles: profileRes.data,
          to_team: toTeamRes.data,
          from_team: fromTeamRes.data,
        };
      })
    );

    return enrichedData;
  },

  async approveTransferRequest(
    requestId: string,
    managerId: string
  ): Promise<void> {
    const { data: request, error: fetchError } = await supabase
      .from('team_transfer_requests')
      .select('user_id, from_team_id, to_team_id')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;
    if (!request) return;

    const { data: toTeam } = await supabase
      .from('teams')
      .select('name')
      .eq('id', request.to_team_id)
      .maybeSingle();

    const requestWithTeam = {
      ...request,
      to_team: toTeam,
    };

    const { error: updateError } = await supabase
      .from('team_transfer_requests')
      .update({
        status: 'approved',
        reviewed_by: managerId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    if (requestWithTeam.from_team_id) {
      await supabase
        .from('team_members')
        .delete()
        .eq('user_id', requestWithTeam.user_id)
        .eq('team_id', requestWithTeam.from_team_id);
    }

    await supabase.from('team_members').insert({
      user_id: requestWithTeam.user_id,
      team_id: requestWithTeam.to_team_id,
      role: 'member',
    });

    await notificationsService.createNotification(
      requestWithTeam.user_id,
      'Demande de Transfert Approuvée',
      `Votre demande de transfert vers l'équipe "${requestWithTeam.to_team?.name}" a été approuvée! Vous faites maintenant partie de cette équipe.`,
      'transfer_approved',
      requestId
    );
  },

  async rejectTransferRequest(
    requestId: string,
    managerId: string
  ): Promise<void> {
    const { data: request, error: fetchError } = await supabase
      .from('team_transfer_requests')
      .select('user_id, to_team_id')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;
    if (!request) return;

    const { data: toTeam } = await supabase
      .from('teams')
      .select('name')
      .eq('id', request.to_team_id)
      .maybeSingle();

    const { error } = await supabase
      .from('team_transfer_requests')
      .update({
        status: 'rejected',
        reviewed_by: managerId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;

    await notificationsService.createNotification(
      request.user_id,
      'Demande de Transfert Refusée',
      `Votre demande de transfert vers l'équipe "${toTeam?.name}" a été refusée par le manager.`,
      'transfer_rejected',
      requestId
    );
  },

  async deleteTransferRequest(requestId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_transfer_requests')
      .delete()
      .eq('id', requestId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting transfer request:', error);
      throw error;
    }
  },

  async getAllTransferRequests(): Promise<TransferRequest[]> {
    const { data, error } = await supabase
      .from('team_transfer_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all transfer requests:', error);
      throw error;
    }

    if (!data) return [];

    const enrichedData = await Promise.all(
      data.map(async (request) => {
        const [profileRes, toTeamRes, fromTeamRes] = await Promise.all([
          supabase.from('profiles').select('full_name, email').eq('id', request.user_id).maybeSingle(),
          supabase.from('teams').select('name').eq('id', request.to_team_id).maybeSingle(),
          request.from_team_id
            ? supabase.from('teams').select('name').eq('id', request.from_team_id).maybeSingle()
            : Promise.resolve({ data: null, error: null })
        ]);

        return {
          ...request,
          profiles: profileRes.data,
          to_team: toTeamRes.data,
          from_team: fromTeamRes.data,
        };
      })
    );

    return enrichedData;
  },
};
