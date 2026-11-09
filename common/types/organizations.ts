
export type OrganizationPhoto = {
  url: string;
  caption: string;
  caption_en?: string | null;
};

export type Organization = {
  id: number;

  name: string;

  role: string;
  role_en?: string | null;

  period: string;

  location: string;
  location_en?: string | null;

  description: string;
  description_en?: string | null;

  logo_url: string;
  photos: OrganizationPhoto[];

  is_show: boolean;
  sort_order: number;
};

export type OrganizationInput = Omit<
  Organization,
  "id"
>;
