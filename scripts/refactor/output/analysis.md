# Analyse des dépendances — `src/pages/EnterpriseDashboard.tsx`

Généré le 2026-04-20T16:47:50.026Z.

**Symboles top-level** : 26
**Composants** : 9
**Helpers** : 12
**Hooks** : 1
**Constantes** : 4
**Types/Interfaces** : 0

## Feuilles extractibles en premier

Ces symboles ne dépendent **d'aucun** autre symbole top-level du fichier
(hors types/interfaces). Ce sont les plus simples à extraire.

| Nom | Lignes | Plage | Deps | Références |
| --- | ---: | --- | ---: | --- |
| `getListData` | 722 | L3042-3763 | 0 |  |
| `mockData` | 166 | L232-397 | 0 |  |
| `getDefaultPerformanceData` | 78 | L2948-3025 | 0 |  |
| `widgetConfigs` | 71 | L2337-2407 | 0 |  |
| `useAdaptiveWidget` | 69 | L161-229 | 0 |  |
| `getNotificationsData` | 66 | L4542-4607 | 0 |  |
| `RentalForm` | 56 | L1428-1483 | 0 |  |
| `getEquipmentAvailabilityData` | 50 | L3766-3815 | 0 |  |
| `getPerformanceScoreData` | 42 | L2591-2632 | 0 |  |
| `getMaintenanceData` | 41 | L4499-4539 | 0 |  |
| `iconMap` | 33 | L123-155 | 0 |  |
| `DonutChart` | 22 | L399-420 | 0 |  |
| `getCalendarData` | 19 | L4459-4477 | 0 |  |
| `getMapData` | 17 | L4480-4496 | 0 |  |
| `Modal` | 15 | L1412-1426 | 0 |  |
| `getMetricData` | 15 | L2574-2588 | 0 |  |
| `getActivityRecommendation` | 12 | L3028-3039 | 0 |  |
| `ResponsiveGridLayout` | 1 | L120-120 | 0 |  |

## Tous les composants (par taille)

| Nom | Lignes | Plage | Deps internes | Principales refs |
| --- | ---: | --- | ---: | --- |
| `EnterpriseDashboard` | 846 | L1489-2334 | 5 | Modal, RentalForm, ResponsiveGridLayout, WidgetComponent, iconMap |
| `ChartWidget` | 507 | L3949-4455 | 1 | iconMap |
| `WidgetComponent` | 426 | L985-1410 | 12 | ChartWidget, ListWidget, MapWidget, MetricWidget, getCalendarData, getEquipmentAvailabilityData… |
| `MetricWidget` | 361 | L424-784 | 3 | DonutChart, iconMap, useAdaptiveWidget |
| `MapWidget` | 197 | L786-982 | 1 | iconMap |
| `ListWidget` | 129 | L3819-3947 | 1 | iconMap |
| `RentalForm` | 56 | L1428-1483 | 0 |  |
| `DonutChart` | 22 | L399-420 | 0 |  |
| `Modal` | 15 | L1412-1426 | 0 |  |

## Helpers top-level

| Nom | Lignes | Plage | Deps | Références |
| --- | ---: | --- | ---: | --- |
| `getListData` | 722 | L3042-3763 | 0 |  |
| `getSalesPerformanceScoreData` | 310 | L2636-2945 | 2 | getActivityRecommendation, getDefaultPerformanceData |
| `renderWidgetContent` | 162 | L2410-2571 | 13 | ChartWidget, ListWidget, MapWidget, MetricWidget, getCalendarData, getEquipmentAvailabilityData… |
| `getDefaultPerformanceData` | 78 | L2948-3025 | 0 |  |
| `getNotificationsData` | 66 | L4542-4607 | 0 |  |
| `getEquipmentAvailabilityData` | 50 | L3766-3815 | 0 |  |
| `getPerformanceScoreData` | 42 | L2591-2632 | 0 |  |
| `getMaintenanceData` | 41 | L4499-4539 | 0 |  |
| `getCalendarData` | 19 | L4459-4477 | 0 |  |
| `getMapData` | 17 | L4480-4496 | 0 |  |
| `getMetricData` | 15 | L2574-2588 | 0 |  |
| `getActivityRecommendation` | 12 | L3028-3039 | 0 |  |

## Hooks top-level

| Nom | Lignes | Plage | Deps | Références |
| --- | ---: | --- | ---: | --- |
| `useAdaptiveWidget` | 69 | L161-229 | 0 |  |
