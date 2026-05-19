export interface University {
  code: string;
  name: string;
  emailDomain: string;
}

export const UNIVERSITIES: University[] = [
  { code: 'MAK', name: 'Makerere University', emailDomain: 'students.mak.ac.ug' },
  { code: 'KYU', name: 'Kyambogo University', emailDomain: 'std.kyu.ac.ug' },
  { code: 'KAB', name: 'Kabale University', emailDomain: 'kab.ac.ug' },
  { code: 'MMU', name: 'Mountains of the Moon', emailDomain: 'mmu.ac.ug' },
  { code: 'MUST', name: 'Mbarara University of Science and Technology', emailDomain: 'std.must.ac.ug' },
  { code: 'BU', name: 'Busitema University', emailDomain: 'busitema.ac.ug' },
];

export const getUniversityByEmail = (email: string): University | null => {
  if (!email || !email.includes('@')) return null;

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;

  return UNIVERSITIES.find((uni) => uni.emailDomain === domain) || null;
};

export const isValidStudentEmail = (email: string): boolean => {
  return getUniversityByEmail(email) !== null;
};

export const validateStudentEmail = (email: string): { isValid: boolean; university: University | null; error?: string } => {
  if (!email) {
    return { isValid: false, university: null, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, university: null, error: 'Please enter a valid email address' };
  }

  const university = getUniversityByEmail(email);

  if (!university) {
    const validDomains = UNIVERSITIES.map((u) => u.emailDomain).join(', ');
    return {
      isValid: false,
      university: null,
      error: `Only verified university emails are accepted. Valid domains: ${validDomains}`,
    };
  }

  return { isValid: true, university };
};
