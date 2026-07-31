export type Lead = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  called: string;
  interested: string;
};

export const calledOptions = ['Not Yet', 'Called'] as const;
export const interestedOptions = ['Not Yet', 'Interested', 'Not Interested'] as const;
