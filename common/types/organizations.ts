
export type OrganizationPhoto = {
  url: string;
  caption: string;
};

export type Organization = {
  id: number;
  name: string;
  role: string;
  period: string;
  location: string;
  description: string;
  logo_url: string;
  photos: OrganizationPhoto[];
  is_show: boolean;
  sort_order: number;
};

export type OrganizationInput = Omit<Organization, "id">;
