import { MACHINE_LIST_COLUMNS, SELLER_MACHINES_MAX_ROWS } from '../../constants/machineQueryFields';
import type { DashboardStats, SalesPerformanceData } from './types';
import supabase from '../supabaseClient';
import { getCurrentUser } from './auth';

// Helper interne : resout la liste des machine ids du vendeur quelle que soit
// la convention de nommage de la colonne fk (sellerid / seller_id / user_id /
// owner_id). Utilise par getDashboardStats, getWeeklyActivityData et
// getSalesPerformanceData.
async function getSellerMachineIds(userId: string): Promise<string[]> {
  const possibleColumns = ['sellerid', 'seller_id', 'user_id', 'owner_id'];
  let ids: string[] | null = null;

  for (const column of possibleColumns) {
    const { data, error } = await supabase
      .from('machines')
      .select('id')
      .eq(column, userId);
    if (error) continue;
    ids = (data || []).map((m: any) => m.id).filter(Boolean);
    break;
  }

  return ids || [];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  // Récupérer les IDs des machines du vendeur (tolérant au nom de colonne)
  const machineIds = await getSellerMachineIds(user.id);

  if (machineIds.length === 0) {
    return {
      totalViews: 0,
      totalMessages: 0,
      totalOffers: 0,
      weeklyViews: 0,
      monthlyViews: 0,
      weeklyGrowth: 0,
      monthlyGrowth: 0
    };
  }

  // Calculer les dates
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Vues totales
  const { count: totalViews } = await supabase
    .from('machine_views')
    .select('id', { count: 'exact', head: true })
    .in('machine_id', machineIds);

  // Vues cette semaine
  const { count: weeklyViews } = await supabase
    .from('machine_views')
    .select('id', { count: 'exact', head: true })
    .in('machine_id', machineIds)
    .gte('created_at', weekAgo.toISOString());

  // Vues ce mois
  const { count: monthlyViews } = await supabase
    .from('machine_views')
    .select('id', { count: 'exact', head: true })
    .in('machine_id', machineIds)
    .gte('created_at', monthAgo.toISOString());

  // Vues semaine précédente (pour calculer la croissance)
  const { count: previousWeekViews } = await supabase
    .from('machine_views')
    .select('id', { count: 'exact', head: true })
    .in('machine_id', machineIds)
    .gte('created_at', twoWeeksAgo.toISOString())
    .lt('created_at', weekAgo.toISOString());

  // Vues mois précédent
  const { count: previousMonthViews } = await supabase
    .from('machine_views')
    .select('id', { count: 'exact', head: true })
    .in('machine_id', machineIds)
    .gte('created_at', twoMonthsAgo.toISOString())
    .lt('created_at', monthAgo.toISOString());

  // Messages reçus
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .or(`receiver_id.eq.${user.id},seller_id.eq.${user.id}`);

  // Offres reçues
  const { count: totalOffers } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', user.id);

  // Calculer les pourcentages de croissance
  const weeklyGrowth = previousWeekViews && previousWeekViews > 0 
    ? Math.round(((weeklyViews || 0) - previousWeekViews) / previousWeekViews * 100)
    : 0;

  const monthlyGrowth = previousMonthViews && previousMonthViews > 0
    ? Math.round(((monthlyViews || 0) - previousMonthViews) / previousMonthViews * 100)
    : 0;

  return {
    totalViews: totalViews || 0,
    totalMessages: totalMessages || 0,
    totalOffers: totalOffers || 0,
    weeklyViews: weeklyViews || 0,
    monthlyViews: monthlyViews || 0,
    weeklyGrowth,
    monthlyGrowth
  };
}

export async function getWeeklyActivityData() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const machineIds = await getSellerMachineIds(user.id);
  
  if (machineIds.length === 0) {
    return Array(7).fill(0);
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data: views } = await supabase
    .from('machine_views')
    .select('created_at')
    .in('machine_id', machineIds)
    .gte('created_at', weekAgo.toISOString());

  // Grouper par jour
  const dailyViews = Array(7).fill(0);
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  views?.forEach(view => {
    const date = new Date(view.created_at);
    const dayIndex = date.getDay();
    dailyViews[dayIndex]++;
  });

  return dailyViews;
}

// -------------------- DASHBOARD VENDEUR --------------------

export async function getSalesPerformanceData(): Promise<SalesPerformanceData> {
  try {
    const user = await getCurrentUser();

    // Récupérer les annonces du vendeur (tolérant au nom de colonne)
    const possibleColumns = ['sellerid', 'seller_id', 'user_id', 'owner_id'];
    let machines: any[] | null = null;
    let machinesError: any = null;

    for (const column of possibleColumns) {
      const result = await supabase
        .from('machines')
        .select(MACHINE_LIST_COLUMNS)
        .eq(column, user.id)
        .limit(SELLER_MACHINES_MAX_ROWS);

      if (result.error) {
        machinesError = result.error;
        continue;
      }

      machines = result.data || [];
      machinesError = null;
      break;
    }

    if (machines === null && machinesError) throw machinesError;
    if (!machines) machines = [];

    // Récupérer les vues des annonces
    const machineIds = machines?.map((m) => m.id).filter(Boolean) || [];
    const { data: views, error: viewsError } =
      machineIds.length > 0
        ? await supabase
            .from('machine_views')
            .select('id, machine_id, created_at')
            .in('machine_id', machineIds)
            .limit(20000)
        : { data: [], error: null };

    if (viewsError) throw viewsError;

    // Récupérer les messages reçus
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, receiver_id, response_time, created_at')
      .eq('receiver_id', user.id)
      .limit(10000);

    if (messagesError) throw messagesError;

    // Récupérer les offres reçues
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('id, seller_id, created_at')
      .eq('seller_id', user.id)
      .limit(10000);

    if (offersError) throw offersError;

    // Calculer les métriques
    const totalMachines = machines?.length || 0;
    const totalViews = views?.length || 0;
    const totalMessages = messages?.length || 0;
    const totalOffers = offers?.length || 0;
    
    // Calculer le score de performance (0-100)
    const viewsScore = Math.min((totalViews / Math.max(totalMachines, 1)) * 20, 20);
    const messagesScore = Math.min((totalMessages / Math.max(totalMachines, 1)) * 30, 30);
    const offersScore = Math.min((totalOffers / Math.max(totalMachines, 1)) * 50, 50);
    const performanceScore = Math.round(viewsScore + messagesScore + offersScore);

    // Calculer le temps de réponse moyen (en heures)
    const responseTime = messages?.length > 0 ? 
      messages.reduce((acc, msg) => {
        const responseTime = msg.response_time || 24; // Par défaut 24h
        return acc + responseTime;
      }, 0) / messages.length : 24;

    // Calculer la croissance (comparaison avec le mois précédent)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthViews = views?.filter(v => {
      const viewDate = new Date(v.created_at);
      return viewDate.getMonth() === currentMonth && viewDate.getFullYear() === currentYear;
    }).length || 0;

    const lastMonthViews = views?.filter(v => {
      const viewDate = new Date(v.created_at);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return viewDate.getMonth() === lastMonth && viewDate.getFullYear() === lastYear;
    }).length || 0;

    const growth = lastMonthViews > 0 ? 
      ((currentMonthViews - lastMonthViews) / lastMonthViews) * 100 : 0;

    // Générer des recommandations basées sur les données
    const recommendations = [];
    
    if (responseTime > 2) {
      recommendations.push({
        type: 'process',
        action: 'Optimiser le temps de réponse',
        impact: `Réduire le temps de réponse de ${responseTime.toFixed(1)}h à 2h`,
        priority: 'high' as const
      });
    }

    if (totalMachines < 5) {
      recommendations.push({
        type: 'prospection',
        action: 'Augmenter le nombre d\'annonces',
        impact: 'Passer de ' + totalMachines + ' à au moins 5 annonces actives',
        priority: 'medium' as const
      });
    }

    if (totalViews < totalMachines * 10) {
      recommendations.push({
        type: 'marketing',
        action: 'Améliorer la visibilité des annonces',
        impact: 'Augmenter le nombre de vues par annonce',
        priority: 'medium' as const
      });
    }

    // Déterminer le niveau d'activité
    let activityLevel = 'faible';
    if (totalViews > 50 && totalMessages > 10) activityLevel = 'élevé';
    else if (totalViews > 20 && totalMessages > 5) activityLevel = 'modéré';

    // Déterminer les tendances
    const trends = {
      sales: growth > 0 ? 'up' as const : growth < 0 ? 'down' as const : 'stable' as const,
      growth: growth > 0 ? 'up' as const : growth < 0 ? 'down' as const : 'stable' as const,
      prospects: totalMessages > 0 ? 'up' as const : 'stable' as const,
      responseTime: responseTime < 24 ? 'down' as const : 'up' as const
    };

    return {
      score: performanceScore,
      target: 85,
      rank: 3, // À calculer par rapport aux autres vendeurs
      totalVendors: 12, // À récupérer depuis la base de données
      sales: totalOffers * 50000, // Estimation basée sur les offres
      salesTarget: 3000000,
      growth: growth,
      growthTarget: 15,
      prospects: totalMessages,
      activeProspects: Math.min(totalMessages, 25),
      responseTime: responseTime,
      responseTarget: 2,
      activityLevel: activityLevel,
      activityRecommendation: recommendations.length > 0 ? 
        recommendations[0].action : 'Continuer les bonnes pratiques',
      recommendations: recommendations,
      trends: trends,
      metrics: {
        sales: { value: totalOffers * 50000, target: 3000000, trend: trends.sales },
        growth: { value: growth, target: 15, trend: trends.growth },
        prospects: { value: totalMessages, target: 25, trend: trends.prospects },
        responseTime: { value: responseTime, target: 2, trend: trends.responseTime }
      }
    };

  } catch (error) {
    console.error('Erreur lors du calcul des performances:', error);
    
    // Retourner des données par défaut en cas d'erreur
    return {
      score: 75,
      target: 85,
      rank: 3,
      totalVendors: 12,
      sales: 0,
      salesTarget: 3000000,
      growth: 0,
      growthTarget: 15,
      prospects: 25,
      activeProspects: 18,
      responseTime: 2.5,
      responseTarget: 1.5,
      activityLevel: 'modéré',
      activityRecommendation: 'Analyser les opportunités d\'amélioration',
      recommendations: [
        {
          type: 'process',
          action: 'Optimiser le temps de réponse',
          impact: 'Réduire le temps de réponse aux prospects de 2.5h à 1.5h',
          priority: 'high' as const
        }
      ],
      trends: {
        sales: 'up' as const,
        growth: 'up' as const,
        prospects: 'stable' as const,
        responseTime: 'down' as const
      },
      metrics: {
        sales: { value: 0, target: 3000000, trend: 'up' as const },
        growth: { value: 0, target: 15, trend: 'up' as const },
        prospects: { value: 18, target: 25, trend: 'stable' as const },
        responseTime: { value: 2.5, target: 1.5, trend: 'down' as const }
      }
    };
  }
}
