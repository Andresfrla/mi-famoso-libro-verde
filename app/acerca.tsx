// =====================================================
// About Screen - Dedicatoria a la Abuelita Clarita
// =====================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/src/lib/constants';

export default function AboutScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: t('settings.aboutApp') }} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagen de la Abuelita */}
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/Abuelita.jpeg')}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Dedicatoria */}
        <View style={[styles.dedicationCard, { backgroundColor: colors.surface }]}>
          <View style={styles.dedicationHeader}>
            <Ionicons name="heart" size={24} color={colors.primary} />
            <Text style={[styles.dedicationTitle, { color: colors.text }]}>
              {t('about.dedicationTitle')}
            </Text>
          </View>
          <Text style={[styles.dedicationText, { color: colors.text }]}>
            <Text style={styles.quote}>
              "{t('about.dedicationText')}"
            </Text>
          </Text>
        </View>

        {/* Descripción de la App */}
        <View style={[styles.descriptionCard, { backgroundColor: colors.surface }]}>
          <View style={styles.descriptionHeader}>
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Text style={[styles.descriptionTitle, { color: colors.text }]}>
              {t('about.aboutTitle')}
            </Text>
          </View>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {t('about.description1')}
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {t('about.description2')}
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {t('about.description3')}
          </Text>
        </View>

        {/* El Libro Verde de Mamita */}
        <View style={[styles.descriptionCard, { backgroundColor: colors.surface }]}>
          <View style={styles.descriptionHeader}>
            <Ionicons name="leaf" size={24} color="#22C55E" />
            <Text style={[styles.descriptionTitle, { color: colors.text }]}>
              El Libro Verde de Mamita
            </Text>
          </View>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            ¡Dicen que en la vida hay que plantar un árbol, tener un hijo y escribir un libro!
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            Pues, creo que esta máxima, Mamita la ha cumplido a "rajatabla" y con honores!
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            Cuantas veces hemos sido testigos todas nosotras y demás miembros de la familia, de las discusiones por "Donde Está Mi Libro Verde, Quien Me Lo Cogió", entonces había que buscarlo en varias casas para ver dónde aparecía y afortunadamente siempre lo hacía.
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            En el año 2003, supongo que temerosa de que alguna le diese "captura" para siempre y nos quedáramos sin él las demás, Mamita tuvo la brillante idea de regalarnos una copia a cada una de nosotras, para que lo tuviésemos y surely - aunque nunca lo ha dicho- para que no la enloqueciéramos todas, todos los días pidiéndole sus deliciosas recetas.
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            Y como siempre, se puso manos a la obra y pasó al computador, todas las recetas que ella misma había ido escribiendo de su puño y letra durante toda su vida.
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            Como hoy, Dios nos ha dado la dicha de estar aquí reunidos otra vez, entre "fogones y manteles", me pareció una fantástica oportunidad para que todos los que hemos disfrutado de estas comidas, durante todos estos años, tuviesen al igual que nosotras, este tan preciado libro de recetas.
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            ¡EL FAMOSO LIBRO VERDE DE MAMITA, YA LO TIENEN!!!
          </Text>
        </View>

        {/* Versión */}
        <Text style={[styles.version, { color: colors.textMuted }]}>
          {t('settings.version')} 2.4.1 (102)
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 120,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.xl,
    borderWidth: 3,
    borderColor: '#22C55E',
  },
  dedicationCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  dedicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dedicationTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.sm,
  },
  dedicationText: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
  quote: {
    fontStyle: 'italic',
  },
  descriptionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  descriptionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.sm,
  },
  descriptionText: {
    fontSize: FontSizes.md,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    marginTop: Spacing.lg,
  },
});
