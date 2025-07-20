"use client"

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AccountModal from '@/components/finance/AccountModal';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFinanceStore } from '@/store/FinanceStore';

export default function TabTwoScreen() {
    const { accounts, setShowAccountModal, createEmptyAccount } = useFinanceStore();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#C8E6C9', dark: '#237D32' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#4CAF50"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ScrollView
          style={styles.titleContainer}
      >
          <View style={styles.list}>
          <TouchableOpacity
            style={styles.button}
            // onPress={() => {addAccount()}}
            onPress={() => {setShowAccountModal(true); createEmptyAccount()}}
          >
              <Text style={styles.buttonText}>Agregar Cuenta</Text>
          </TouchableOpacity>
          {accounts.map((account) => (
            <View
              key={account.name}
              // style={styles.list}
            >
              <Text>{account.name}</Text>
              <Text>{account.percentage}%</Text>
              <Text>{account.balance}</Text>
            </View>
          ))}
          </View>
      </ScrollView>
      <AccountModal />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    flexDirection: 'column',
    gap: 24,
  }
});