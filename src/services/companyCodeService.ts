import { supabase } from '../lib/supabase';

export const companyCodeService = {
  async verifyCode(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('company_codes')
        .select('code')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error verifying company code:', error);
      return false;
    }
  },

  async getCompanyByCode(code: string) {
    try {
      const { data, error } = await supabase
        .from('company_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting company:', error);
      return null;
    }
  },
};
