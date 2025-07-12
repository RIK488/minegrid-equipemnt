// Types pour la communication
export interface EmailData {
  to: string;
  subject: string;
  body: string;
  template?: string;
  attachments?: File[];
}

export interface SMSData {
  to: string;
  message: string;
  template?: string;
}

export interface ContactData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

// Service de communication unifié
class CommunicationService {
  // Envoyer un email
  async sendEmail(emailData: EmailData) {
    try {
      // Simulation d'envoi d'email (à remplacer par une vraie API)
      console.log('📧 Envoi email:', {
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body.substring(0, 100) + '...'
      });

      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        messageId: `email_${Date.now()}`,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi de l\'email'
      };
    }
  }

  // Envoyer un SMS
  async sendSMS(smsData: SMSData) {
    try {
      // Simulation d'envoi de SMS (à remplacer par une vraie API)
      console.log('📱 Envoi SMS:', {
        to: smsData.to,
        message: smsData.message.substring(0, 50) + '...'
      });

      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        messageId: `sms_${Date.now()}`,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du SMS'
      };
    }
  }

  // Templates d'emails prédéfinis
  async sendFollowUpEmail(contact: ContactData, actionTitle: string) {
    const emailData: EmailData = {
      to: contact.email!,
      subject: `Suivi - ${actionTitle}`,
      body: `
        Bonjour ${contact.name},

        J'espère que vous allez bien. Je me permets de vous contacter concernant ${actionTitle}.

        Nous avons discuté récemment et je souhaiterais faire un point sur votre projet.

        Pouvez-vous me confirmer un créneau pour un échange téléphonique ?

        Cordialement,
        L'équipe Minegrid Équipement
      `,
      template: 'follow-up'
    };

    return this.sendEmail(emailData);
  }

  async sendQuoteEmail(contact: ContactData, equipmentName: string, quoteValue: number) {
    const emailData: EmailData = {
      to: contact.email!,
      subject: `Devis - ${equipmentName}`,
      body: `
        Bonjour ${contact.name},

        Suite à votre demande, veuillez trouver ci-joint le devis pour ${equipmentName}.

        Montant total : ${quoteValue.toLocaleString()} MAD

        Ce devis est valable 30 jours.

        N'hésitez pas à me contacter pour toute question.

        Cordialement,
        L'équipe Minegrid Équipement
      `,
      template: 'quote'
    };

    return this.sendEmail(emailData);
  }

  async sendPromotionEmail(contact: ContactData, promotionTitle: string, discount: number) {
    const emailData: EmailData = {
      to: contact.email!,
      subject: `Offre spéciale - ${promotionTitle}`,
      body: `
        Bonjour ${contact.name},

        Nous avons le plaisir de vous informer d'une offre spéciale : ${promotionTitle}

        Réduction de ${discount}% sur une sélection d'équipements.

        Cette offre est limitée dans le temps, n'hésitez pas à nous contacter rapidement.

        Cordialement,
        L'équipe Minegrid Équipement
      `,
      template: 'promotion'
    };

    return this.sendEmail(emailData);
  }

  async sendMeetingReminderEmail(contact: ContactData, meetingDate: string, meetingTime: string) {
    const emailData: EmailData = {
      to: contact.email!,
      subject: 'Rappel - Rendez-vous',
      body: `
        Bonjour ${contact.name},

        Je vous rappelle notre rendez-vous prévu le ${meetingDate} à ${meetingTime}.

        Nous nous réjouissons de vous rencontrer.

        Cordialement,
        L'équipe Minegrid Équipement
      `,
      template: 'reminder'
    };

    return this.sendEmail(emailData);
  }

  // Templates de SMS prédéfinis
  async sendFollowUpSMS(contact: ContactData, actionTitle: string) {
    const smsData: SMSData = {
      to: contact.phone!,
      message: `Bonjour ${contact.name}, je vous contacte concernant ${actionTitle}. Pouvez-vous me rappeler ? Minegrid Équipement`,
      template: 'follow-up'
    };

    return this.sendSMS(smsData);
  }

  async sendMeetingReminderSMS(contact: ContactData, meetingDate: string, meetingTime: string) {
    const smsData: SMSData = {
      to: contact.phone!,
      message: `Rappel : RDV le ${meetingDate} à ${meetingTime}. Minegrid Équipement`,
      template: 'reminder'
    };

    return this.sendSMS(smsData);
  }

  async sendPromotionSMS(contact: ContactData, promotionTitle: string) {
    const smsData: SMSData = {
      to: contact.phone!,
      message: `Offre spéciale : ${promotionTitle}. Contactez-nous rapidement ! Minegrid Équipement`,
      template: 'promotion'
    };

    return this.sendSMS(smsData);
  }

  // Méthodes utilitaires
  async initiateContact(contact: ContactData, actionTitle: string, method: 'email' | 'sms' | 'both' = 'email') {
    const results = [];

    if (method === 'email' || method === 'both') {
      if (contact.email) {
        const emailResult = await this.sendFollowUpEmail(contact, actionTitle);
        results.push({ type: 'email', ...emailResult });
      }
    }

    if (method === 'sms' || method === 'both') {
      if (contact.phone) {
        const smsResult = await this.sendFollowUpSMS(contact, actionTitle);
        results.push({ type: 'sms', ...smsResult });
      }
    }

    return results;
  }

  async scheduleFollowUp(contact: ContactData, actionTitle: string, followUpDate: string) {
    // Programmer un suivi automatique
    const scheduledTime = new Date(followUpDate);
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(async () => {
        await this.initiateContact(contact, actionTitle);
      }, delay);
    }

    return {
      success: true,
      scheduledFor: followUpDate,
      message: 'Suivi programmé avec succès'
    };
  }

  // Validation des données de contact
  validateContact(contact: ContactData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!contact.name) {
      errors.push('Le nom est requis');
    }

    if (!contact.email && !contact.phone) {
      errors.push('Au moins un email ou un téléphone est requis');
    }

    if (contact.email && !this.isValidEmail(contact.email)) {
      errors.push('Format d\'email invalide');
    }

    if (contact.phone && !this.isValidPhone(contact.phone)) {
      errors.push('Format de téléphone invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
  }
}

export const communicationService = new CommunicationService(); 