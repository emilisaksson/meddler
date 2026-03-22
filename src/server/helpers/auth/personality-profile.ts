import type { HydratedDocument } from 'mongoose';
import type { User, UserPersonalityResponse } from '../../integrations/mongodb/models/user-model';
import { normalizeOptionalText } from '../../utils/text';

export interface PersonalityQuestionDefinition {
  id: string;
  question: string;
}

export const personalityQuestions: PersonalityQuestionDefinition[] = [
  {
    id: 'communication-style',
    question: 'How do you usually prefer people to communicate with you when a topic is difficult?'
  },
  {
    id: 'response-style',
    question: 'What kind of responses feel most helpful to you: direct, gentle, detailed, brief, or something else?'
  },
  {
    id: 'feeling-heard',
    question: 'What tends to make you feel understood and respected in a conversation?'
  },
  {
    id: 'sensitive-patterns',
    question: 'Are there any phrases, tones, or patterns that usually make communication harder for you?'
  },
  {
    id: 'background-context',
    question: 'What personal background or context would help someone understand where you are coming from?'
  },
  {
    id: 'anything-else',
    question: 'Is there anything else you would like to share that can help me understand you better?'
  }
];

const personalityQuestionMap = new Map(
  personalityQuestions.map((question, index) => [question.id, { ...question, index }])
);

export function buildPersonalityResponses(
  inputResponses: Array<{
    questionId: string;
    answer?: string | null;
  }>
): UserPersonalityResponse[] {
  const responsesById = new Map<string, UserPersonalityResponse>();

  for (const inputResponse of inputResponses) {
    const question = personalityQuestionMap.get(inputResponse.questionId);

    if (!question || responsesById.has(question.id)) {
      continue;
    }

    responsesById.set(question.id, {
      questionId: question.id,
      question: question.question,
      answer: normalizeOptionalText(inputResponse.answer)
    });
  }

  return [...responsesById.values()].sort((left, right) => {
    const leftIndex = personalityQuestionMap.get(left.questionId)?.index ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = personalityQuestionMap.get(right.questionId)?.index ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
}

export function generatePersonalityMarkdown(
  user: Pick<User, 'name' | 'language' | 'country'>,
  responses: UserPersonalityResponse[]
): string {
  const answeredResponses = responses.filter((response) => Boolean(response.answer));
  const lines: string[] = ['# Personality Profile', ''];

  if (user.name) {
    lines.push(`Name: ${user.name}`, '');
  }

  lines.push('## Tailoring Notes', '');

  if (answeredResponses.length === 0) {
    lines.push(
      'The user skipped the detailed questionnaire. Default to clear, respectful, efficient communication and adapt based on the live conversation.',
      ''
    );
  } else {
    for (const response of answeredResponses) {
      lines.push(`### ${response.question}`, '', response.answer ?? '', '');
    }
  }

  lines.push('## Defaults', '');

  if (user.language) {
    lines.push(`- Preferred language code: ${user.language}`);
  }

  if (user.country) {
    lines.push(`- Country code: ${user.country}`);
  }

  lines.push('- Prioritize clarity, empathy, and practical next steps.');

  return lines.join('\n').trim();
}

export function hasSavedPersonality(user: Pick<User, 'personality'>): boolean {
  return Boolean(normalizeOptionalText(user.personality));
}

export function getPersonalityMarkdown(user: Pick<User, 'personality'>): string | null {
  return normalizeOptionalText(user.personality);
}

export function getStoredPersonalityResponses(
  user: HydratedDocument<User>
): UserPersonalityResponse[] {
  return Array.isArray(user.personalityResponses) ? user.personalityResponses : [];
}
