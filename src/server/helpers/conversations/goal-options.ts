export interface ConversationGoalOption {
  key: string;
  label: string;
}

export const conversationGoalOptions: ConversationGoalOption[] = [
  {
    key: 'solve-a-disagreement',
    label: 'Solve a disagreement'
  },
  {
    key: 'work-out-a-relationship-issue',
    label: 'Work out a relationship issue'
  },
  {
    key: 'get-to-know-each-other-better',
    label: 'Get to know each other better'
  },
  {
    key: 'rebuild-trust-after-a-hurt',
    label: 'Rebuild trust after a hurt'
  },
  {
    key: 'set-healthier-boundaries',
    label: 'Set healthier boundaries'
  },
  {
    key: 'make-a-shared-decision',
    label: 'Make a shared decision'
  }
];

export function findConversationGoal(goalKey: string): ConversationGoalOption | undefined {
  return conversationGoalOptions.find((goal) => goal.key === goalKey);
}
