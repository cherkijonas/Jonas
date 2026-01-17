import { supabase } from '../lib/supabase';

interface ToolAnalysisRequest {
  userId: string;
  toolName: string;
  integrationId: string;
  toolCategory: string;
  usageData?: any;
}

interface DetectedProblem {
  problem_type: 'friction' | 'performance' | 'cost' | 'security' | 'workflow';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  ai_recommendation: string;
  metadata?: any;
}

class AIAnalysisService {
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!openAIKey) {
        console.warn('OpenAI API key not configured');
        return this.getMockAnalysis();
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert IT operations analyst specializing in workplace productivity tools. Analyze tool usage patterns and identify problems, inefficiencies, and provide actionable recommendations. Always respond in French and in valid JSON format.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      return this.getMockAnalysis();
    }
  }

  private getMockAnalysis(): string {
    return JSON.stringify({
      problems: [
        {
          problem_type: 'friction',
          severity: 'medium',
          title: 'Configuration initiale requise',
          description: 'L\'outil vient d\'être connecté et nécessite une configuration pour une analyse complète.',
          ai_recommendation: 'Configurez les paramètres de l\'outil et assurez-vous que toutes les permissions nécessaires sont accordées pour permettre une analyse approfondie.',
        },
      ],
    });
  }

  async analyzeToolIntegration(request: ToolAnalysisRequest): Promise<DetectedProblem[]> {
    const prompt = `
Analyse l'intégration de l'outil suivant et détecte les problèmes potentiels :

Outil : ${request.toolName}
Catégorie : ${request.toolCategory}
Données d'usage : ${JSON.stringify(request.usageData || {})}

Identifie les problèmes dans ces catégories :
- friction : Difficultés d'utilisation, processus complexes
- performance : Lenteurs, temps de réponse élevés
- cost : Coûts inutiles, licences non utilisées
- security : Vulnérabilités, problèmes de sécurité
- workflow : Processus inefficaces, redondances

Pour chaque problème détecté, fournis :
- problem_type : type du problème
- severity : low, medium, high, ou critical
- title : titre court et percutant (max 60 caractères)
- description : description détaillée du problème (max 200 caractères)
- ai_recommendation : recommandation concrète et actionnable (max 300 caractères)

Réponds UNIQUEMENT avec un objet JSON valide au format :
{
  "problems": [
    {
      "problem_type": "friction",
      "severity": "medium",
      "title": "...",
      "description": "...",
      "ai_recommendation": "..."
    }
  ]
}
`;

    try {
      const responseText = await this.callOpenAI(prompt);

      await supabase.from('ai_analysis_logs').insert({
        user_id: request.userId,
        integration_id: request.integrationId,
        analysis_type: 'tool_integration',
        prompt: prompt,
        response: responseText,
        tokens_used: Math.floor(responseText.length / 4),
      });

      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(cleanedResponse);

      return analysis.problems || [];
    } catch (error) {
      console.error('Failed to analyze tool:', error);
      return [];
    }
  }

  async saveDetectedProblems(
    userId: string,
    integrationId: string,
    toolName: string,
    problems: DetectedProblem[]
  ): Promise<void> {
    const problemsToInsert = problems.map((problem) => ({
      user_id: userId,
      integration_id: integrationId,
      tool_name: toolName,
      problem_type: problem.problem_type,
      severity: problem.severity,
      title: problem.title,
      description: problem.description,
      ai_recommendation: problem.ai_recommendation,
      metadata: problem.metadata || {},
    }));

    if (problemsToInsert.length > 0) {
      const { error } = await supabase.from('tool_problems').insert(problemsToInsert);
      if (error) {
        console.error('Failed to save problems:', error);
        throw error;
      }
    }
  }

  async getActiveProblems(userId: string) {
    const { data, error } = await supabase
      .from('tool_problems')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'solved')
      .order('severity', { ascending: false })
      .order('detected_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch problems:', error);
      return [];
    }

    return data || [];
  }

  async updateProblemStatus(
    problemId: string,
    status: 'detected' | 'acknowledged' | 'in_progress' | 'solved'
  ) {
    const updateData: any = { status };

    if (status === 'solved') {
      updateData.solved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('tool_problems')
      .update(updateData)
      .eq('id', problemId);

    if (error) {
      console.error('Failed to update problem status:', error);
      throw error;
    }
  }

  async getSolvedProblems(userId: string) {
    const { data, error } = await supabase
      .from('tool_problems')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'solved')
      .order('solved_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Failed to fetch solved problems:', error);
      return [];
    }

    return data || [];
  }

  async getProblemsByTool(userId: string, toolName: string) {
    const { data, error } = await supabase
      .from('tool_problems')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_name', toolName)
      .order('detected_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch problems by tool:', error);
      return [];
    }

    return data || [];
  }

  async getAnalysisStats(userId: string) {
    const { data, error } = await supabase
      .from('tool_problems')
      .select('status, severity, problem_type')
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to fetch analysis stats:', error);
      return {
        total: 0,
        active: 0,
        solved: 0,
        bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
        byType: { friction: 0, performance: 0, cost: 0, security: 0, workflow: 0 },
      };
    }

    const stats = {
      total: data.length,
      active: data.filter((p) => p.status !== 'solved').length,
      solved: data.filter((p) => p.status === 'solved').length,
      bySeverity: {
        low: data.filter((p) => p.severity === 'low').length,
        medium: data.filter((p) => p.severity === 'medium').length,
        high: data.filter((p) => p.severity === 'high').length,
        critical: data.filter((p) => p.severity === 'critical').length,
      },
      byType: {
        friction: data.filter((p) => p.problem_type === 'friction').length,
        performance: data.filter((p) => p.problem_type === 'performance').length,
        cost: data.filter((p) => p.problem_type === 'cost').length,
        security: data.filter((p) => p.problem_type === 'security').length,
        workflow: data.filter((p) => p.problem_type === 'workflow').length,
      },
    };

    return stats;
  }
}

export const aiAnalysisService = new AIAnalysisService();
