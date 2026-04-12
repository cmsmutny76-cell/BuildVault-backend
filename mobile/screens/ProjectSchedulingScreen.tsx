import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MobileScreenHeader from '../components/MobileScreenHeader';
import {
  schedulerAPI,
  type SchedulerState,
  type SchedulerTask,
  type SchedulerTaskStatus,
} from '../services/api';

interface ProjectSchedulingScreenProps {
  onBack: () => void;
  userId: string;
}

type Persona = 'superintendent' | 'project-manager' | 'owner';

const STATUS_ORDER: SchedulerTaskStatus[] = ['not-started', 'in-progress', 'blocked', 'completed'];

function normalizeTask(task: SchedulerTask): SchedulerTask {
  return {
    ...task,
    predecessorIds: Array.isArray(task.predecessorIds) ? task.predecessorIds : [],
    weatherDelayDays: typeof task.weatherDelayDays === 'number' ? task.weatherDelayDays : 0,
  };
}

function isAtRisk(task: SchedulerTask) {
  return task.status === 'blocked' || Boolean(task.constraintType && task.constraintType !== 'none');
}

export default function ProjectSchedulingScreen({ onBack, userId }: ProjectSchedulingScreenProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [persona, setPersona] = useState<Persona>('project-manager');
  const [state, setState] = useState<SchedulerState>({ projects: [], tasks: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await schedulerAPI.getSchedulerState(userId);
        setState({
          projects: response.state.projects || [],
          tasks: (response.state.tasks || []).map(normalizeTask),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load scheduler';
        Alert.alert('Scheduler error', message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const metrics = useMemo(() => {
    const tasks = state.tasks;
    const ready = tasks.filter((task) => task.status === 'not-started' && !isAtRisk(task)).length;
    const constrained = tasks.filter((task) => isAtRisk(task)).length;
    const complete = tasks.filter((task) => task.status === 'completed').length;
    return { total: tasks.length, ready, constrained, complete };
  }, [state.tasks]);

  const updateTask = (taskId: string, patch: Partial<SchedulerTask>) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...patch,
              progress: patch.status === 'completed' ? 100 : task.progress,
              lastFieldUpdateAt: new Date().toISOString(),
            }
          : task
      ),
    }));
  };

  const applyWeatherDelay = (task: SchedulerTask) => {
    const days = (task.weatherDelayDays || 0) + 1;
    updateTask(task.id, {
      weatherDelayDays: days,
      weatherCondition: task.weatherCondition || 'Weather delay logged from mobile',
      constraintType: task.constraintType === 'none' || !task.constraintType ? 'weather' : task.constraintType,
      status: task.status === 'completed' ? 'completed' : 'blocked',
    });
  };

  const saveState = async () => {
    setSaving(true);
    try {
      await schedulerAPI.saveSchedulerState(userId, state);
      Alert.alert('Saved', 'Scheduler updates synced.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save scheduler';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <MobileScreenHeader
          onBack={onBack}
          backLabel="<- Back"
          title="Project Scheduling"
          subtitle="Field-ready lookahead and controls"
          theme="dark"
        />
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loaderText}>Loading scheduler...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MobileScreenHeader
        onBack={onBack}
        backLabel="<- Back"
        title="Project Scheduling"
        subtitle="Field-ready lookahead and controls"
        theme="dark"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.personaRow}>
          {(['superintendent', 'project-manager', 'owner'] as Persona[]).map((role) => {
            const selected = persona === role;
            return (
              <TouchableOpacity
                key={role}
                style={[styles.personaChip, selected ? styles.personaChipSelected : null]}
                onPress={() => setPersona(role)}
              >
                <Text style={[styles.personaChipText, selected ? styles.personaChipTextSelected : null]}>{role}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total</Text>
            <Text style={styles.metricValue}>{metrics.total}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Ready</Text>
            <Text style={styles.metricValue}>{metrics.ready}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Constrained</Text>
            <Text style={styles.metricValue}>{metrics.constrained}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Complete</Text>
            <Text style={styles.metricValue}>{metrics.complete}</Text>
          </View>
        </View>

        {STATUS_ORDER.map((status) => {
          const tasks = state.tasks.filter((task) => task.status === status);
          if (!tasks.length) return null;

          return (
            <View key={status} style={styles.columnCard}>
              <Text style={styles.columnTitle}>{status.replace('-', ' ').toUpperCase()}</Text>

              {tasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskMeta}>{task.phase} • {task.assignee}</Text>

                  <Text style={styles.taskHint}>Constraint: {task.constraintType || 'none'}</Text>
                  {task.weatherDelayDays ? (
                    <Text style={styles.taskHint}>Weather delay days: {task.weatherDelayDays}</Text>
                  ) : null}

                  {persona !== 'owner' ? (
                    <View style={styles.quickActionRow}>
                      <TouchableOpacity style={styles.quickAction} onPress={() => updateTask(task.id, { status: 'in-progress' })}>
                        <Text style={styles.quickActionText}>Start</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickAction} onPress={() => updateTask(task.id, { status: 'blocked' })}>
                        <Text style={styles.quickActionText}>Block</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickAction} onPress={() => updateTask(task.id, { status: 'completed' })}>
                        <Text style={styles.quickActionText}>Complete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickAction} onPress={() => applyWeatherDelay(task)}>
                        <Text style={styles.quickActionText}>Weather +1d</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <TextInput
                    style={styles.logInput}
                    value={task.dailyLog || ''}
                    onChangeText={(text) => updateTask(task.id, { dailyLog: text })}
                    editable={persona !== 'owner'}
                    multiline
                    placeholder="Daily field log"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              ))}
            </View>
          );
        })}

        <TouchableOpacity style={[styles.saveButton, saving ? styles.saveButtonDisabled : null]} onPress={saveState} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Scheduler State'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    color: '#cbd5e1',
  },
  personaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  personaChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  personaChipSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#78350f',
  },
  personaChipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  personaChipTextSelected: {
    color: '#fde68a',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metricCard: {
    flexGrow: 1,
    minWidth: '22%',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  columnCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
  },
  columnTitle: {
    color: '#f8fafc',
    fontWeight: '800',
    marginBottom: 8,
  },
  taskCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    padding: 10,
    marginBottom: 8,
  },
  taskTitle: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  taskMeta: {
    color: '#93c5fd',
    marginTop: 3,
    fontSize: 12,
  },
  taskHint: {
    color: '#cbd5e1',
    marginTop: 4,
    fontSize: 12,
  },
  quickActionRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickAction: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  quickActionText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 12,
  },
  logInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#f8fafc',
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: '#020617',
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 16,
  },
});
