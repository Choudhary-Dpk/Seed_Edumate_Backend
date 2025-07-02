import { MappedEdumateContact } from "../types";

export class EdumateContactUtils {
  /**
   * Calculate application progress percentage based on various factors
   */
  static calculateApplicationProgress(contact: MappedEdumateContact): number {
    let progress = 0;
    const weights = {
      personalInfo: 20,
      academicInfo: 25,
      testScores: 20,
      financialInfo: 15,
      applicationStatus: 20
    };

    // Personal information completeness
    if (contact.firstName && contact.lastName && contact.email) progress += weights.personalInfo * 0.7;
    if (contact.phoneNumber) progress += weights.personalInfo * 0.3;

    // Academic information completeness
    if (contact.currentEducation?.level && contact.targetEducation?.degreeLevel) {
      progress += weights.academicInfo * 0.6;
    }
    if (contact.targetEducation?.studyDestination && contact.targetEducation?.courseMajor) {
      progress += weights.academicInfo * 0.4;
    }

    // Test scores completeness
    const hasTestScores = contact.testScores && (
      contact.testScores.gmat || contact.testScores.gre || 
      contact.testScores.toefl || contact.testScores.ielts
    );
    if (hasTestScores) progress += weights.testScores;

    // Financial information completeness
    if (contact.financialProfile?.totalCourseCost && contact.financialProfile?.loanAmountRequired) {
      progress += weights.financialInfo;
    }

    // Application status weight
    const statusProgress = this.getStatusProgress(contact.admissionStatus);
    progress += weights.applicationStatus * (statusProgress / 100);

    return Math.min(100, Math.round(progress));
  }

  /**
   * Get application status progress percentage
   */
  static getStatusProgress(status?: string): number {
    const statusMap: Record<string, number> = {
      'Not Applied': 0,
      'Applied': 40,
      'Interview Scheduled': 60,
      'Waitlisted': 70,
      'Admitted': 100,
      'Rejected': 30
    };
    return statusMap[status || 'Not Applied'] || 0;
  }

  /**
   * Calculate priority score based on various factors
   */
  static calculatePriorityScore(contact: MappedEdumateContact): number {
    let score = 50; // Base score

    // Academic excellence bonus
    if (contact.currentEducation?.cgpaPercentage && contact.currentEducation.cgpaPercentage > 85) {
      score += 15;
    }

    // Test scores bonus
    if (contact.testScores) {
      if (contact.testScores.gmat && contact.testScores.gmat > 700) score += 10;
      if (contact.testScores.gre && contact.testScores.gre > 320) score += 10;
      if (contact.testScores.toefl && contact.testScores.toefl > 100) score += 8;
      if (contact.testScores.ielts && contact.testScores.ielts > 7.5) score += 8;
    }

    // Financial readiness bonus
    if (contact.financialProfile?.selfFundingAmount && contact.financialProfile?.totalCourseCost) {
      const selfFundingRatio = contact.financialProfile.selfFundingAmount / contact.financialProfile.totalCourseCost;
      if (selfFundingRatio > 0.5) score += 12;
      else if (selfFundingRatio > 0.3) score += 8;
    }

    // Lead quality bonus
    if (contact.leadAttribution?.leadQualityScore && contact.leadAttribution.leadQualityScore > 80) {
      score += 10;
    }

    // Premium destination bonus
    const premiumDestinations = ['US', 'UK', 'Canada', 'Australia'];
    if (contact.targetEducation?.studyDestination && 
        premiumDestinations.includes(contact.targetEducation.studyDestination)) {
      score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Suggest next actions based on contact status and data
   */
  static suggestNextActions(contact: MappedEdumateContact): string[] {
    const actions: string[] = [];

    // Based on admission status
    switch (contact.admissionStatus) {
      case 'Not Applied':
        actions.push('Schedule counseling session', 'Complete application documents');
        break;
      case 'Applied':
        actions.push('Follow up on application status', 'Prepare for potential interview');
        break;
      case 'Interview Scheduled':
        actions.push('Send interview preparation materials', 'Confirm interview logistics');
        break;
      case 'Waitlisted':
        actions.push('Submit additional documents', 'Consider backup options');
        break;
      case 'Admitted':
        actions.push('Begin visa process', 'Arrange accommodation', 'Process loan application');
        break;
      case 'Rejected':
        actions.push('Explore alternative universities', 'Review and improve application');
        break;
    }

    // Missing information actions
    if (!contact.testScores || (!contact.testScores.gmat && !contact.testScores.gre)) {
      actions.push('Schedule standardized test (GRE/GMAT)');
    }

    if (!contact.testScores?.toefl && !contact.testScores?.ielts) {
      actions.push('Schedule English proficiency test (TOEFL/IELTS)');
    }

    if (!contact.financialProfile?.totalCourseCost) {
      actions.push('Calculate total course cost including living expenses');
    }

    // Overdue follow-up
    if (contact.applicationJourney?.nextFollowUpDate && 
        new Date(contact.applicationJourney.nextFollowUpDate) < new Date()) {
      actions.push('URGENT: Follow up overdue - contact immediately');
    }

    return actions;
  }

  /**
   * Generate contact summary for quick overview
   */
  static generateContactSummary(contact: MappedEdumateContact): {
    title: string;
    subtitle: string;
    keyMetrics: Array<{ label: string; value: string | number }>;
    riskFactors: string[];
  } {
    const progress = this.calculateApplicationProgress(contact);
    const priorityScore = this.calculatePriorityScore(contact);

    const title = contact.fullName || `${contact.firstName} ${contact.lastName}`;
    const subtitle = [
      contact.targetEducation?.degreeLevel,
      contact.targetEducation?.courseMajor,
      contact.targetEducation?.studyDestination
    ].filter(Boolean).join(' • ');

    const keyMetrics = [
      { label: 'Progress', value: `${progress}%` },
      { label: 'Priority Score', value: priorityScore },
      { label: 'Status', value: contact.admissionStatus || 'Not Applied' },
      { label: 'Counselor', value: contact.applicationJourney?.assignedCounselor || 'Unassigned' }
    ];

    const riskFactors: string[] = [];
    if (progress < 30) riskFactors.push('Low application progress');
    if (!contact.applicationJourney?.assignedCounselor) riskFactors.push('No assigned counselor');
    if (contact.applicationJourney?.priorityLevel === 'Low') riskFactors.push('Low priority level');
    if (!contact.testScores || (!contact.testScores.gmat && !contact.testScores.gre)) {
      riskFactors.push('Missing standardized test scores');
    }

    return { title, subtitle, keyMetrics, riskFactors };
  }

  /**
   * Validate contact data and return validation errors
   */
  static validateContactData(contact: Partial<MappedEdumateContact>): string[] {
    const errors: string[] = [];

    if (!contact.firstName?.trim()) errors.push('First name is required');
    if (!contact.lastName?.trim()) errors.push('Last name is required');
    
    if (contact.email && !this.isValidEmail(contact.email)) {
      errors.push('Invalid email format');
    }

    if (contact.phoneNumber && !this.isValidPhoneNumber(contact.phoneNumber)) {
      errors.push('Invalid phone number format');
    }

    if (contact.dateOfBirth) {
      const age = this.calculateAge(contact.dateOfBirth);
      if (age < 16 || age > 50) {
        errors.push('Age should be between 16 and 50 years');
      }
    }

    if (contact.currentEducation?.cgpaPercentage) {
      if (contact.currentEducation.cgpaPercentage < 0 || contact.currentEducation.cgpaPercentage > 100) {
        errors.push('CGPA percentage should be between 0 and 100');
      }
    }

    return errors;
  }

  /**
   * Check if email format is valid
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if phone number format is valid
   */
  private static isValidPhoneNumber(phone: string): boolean {
    // Simple phone validation - can be enhanced based on requirements
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Calculate age from date of birth
   */
  private static calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Format contact data for display
   */
  static formatContactForDisplay(contact: MappedEdumateContact): Record<string, any> {
    return {
      id: contact.id,
      name: contact.fullName,
      email: contact.email,
      phone: contact.phoneNumber,
      admissionStatus: contact.admissionStatus,
      targetDestination: contact.targetEducation?.studyDestination,
      targetDegree: contact.targetEducation?.degreeLevel,
      targetMajor: contact.targetEducation?.courseMajor,
      currentEducation: contact.currentEducation?.level,
      currentInstitution: contact.currentEducation?.institution,
      cgpa: contact.currentEducation?.cgpaPercentage,
      testScores: {
        gmat: contact.testScores?.gmat,
        gre: contact.testScores?.gre,
        toefl: contact.testScores?.toefl,
        ielts: contact.testScores?.ielts
      },
      assignedCounselor: contact.applicationJourney?.assignedCounselor,
      priorityLevel: contact.applicationJourney?.priorityLevel,
      leadSource: contact.leadAttribution?.leadSource,
      totalCourseCost: contact.financialProfile?.totalCourseCost,
      loanRequired: contact.financialProfile?.loanAmountRequired,
      nextFollowUp: contact.applicationJourney?.nextFollowUpDate,
      createdAt: contact.createdAt,
      lastModified: contact.updatedAt
    };
  }
}

