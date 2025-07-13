import { useCallback } from 'react';

type MessageType = 'SMS' | 'EMAIL' | 'TEAM' | 'NOTIFICATION';

export function useCommunicationService() {
  const sendMessage = useCallback(async (type: MessageType, recipient: string, content: string) => {
    try {
      console.log(`Sending ${type} message to ${recipient}:`, content);
      
      // Simulation d'envoi de message
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simuler différents types de messages
      switch (type) {
        case 'SMS':
          console.log(`SMS sent to ${recipient}: ${content}`);
          break;
        case 'EMAIL':
          console.log(`Email sent to ${recipient}: ${content}`);
          break;
        case 'TEAM':
          console.log(`Team notification sent to ${recipient}: ${content}`);
          break;
        case 'NOTIFICATION':
          console.log(`In-app notification sent to ${recipient}: ${content}`);
          break;
      }
      
      return { success: true, messageId: Date.now().toString() };
    } catch (error) {
      console.error('Communication error:', error);
      throw error;
    }
  }, []);

  const sendBulkMessage = useCallback(async (type: MessageType, recipients: string[], content: string) => {
    try {
      console.log(`Sending bulk ${type} to ${recipients.length} recipients:`, content);
      
      // Simulation d'envoi en masse
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { 
        success: true, 
        sent: recipients.length,
        messageIds: recipients.map(() => Date.now().toString())
      };
    } catch (error) {
      console.error('Bulk communication error:', error);
      throw error;
    }
  }, []);

  return { sendMessage, sendBulkMessage };
} 