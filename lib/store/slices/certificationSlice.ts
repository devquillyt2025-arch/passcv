import { v4 as uuidv4 } from 'uuid';
import { StoreSlice, CertificationSlice } from './types';

export const createCertificationSlice: StoreSlice<CertificationSlice> = (set) => ({
  addCertification: () =>
    set((state) => ({
      data: {
        ...state.data,
        certifications: [
          ...(state.data.certifications || []),
          {
            id: uuidv4(),
            name: '',
            issuer: '',
            issueDate: '',
            expiryDate: '',
            doesNotExpire: false,
            credentialId: '',
            credentialUrl: '',
          },
        ],
      },
    })),

  updateCertification: (id, cert) =>
    set((state) => ({
      data: {
        ...state.data,
        certifications: (state.data.certifications || []).map((c) =>
          c.id === id ? { ...c, ...cert } : c
        ),
      },
    })),

  removeCertification: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        certifications: (state.data.certifications || []).filter((c) => c.id !== id),
      },
    })),

  reorderCertifications: (startIndex, endIndex) =>
    set((state) => {
      const items = Array.from(state.data.certifications || []);
      const [removed] = items.splice(startIndex, 1);
      items.splice(endIndex, 0, removed);
      return { data: { ...state.data, certifications: items } };
    }),
});
