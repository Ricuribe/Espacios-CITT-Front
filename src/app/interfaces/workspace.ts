

export interface Workspace {
  id_workspace: number;
  name: string;
  space_type: string;
  description: string;
  max_occupancy: number;
  zone_space: string;
  zone_space_display: string;
  enabled: boolean;
  resources: Resource[];
}

export interface Resource {
  id_resource: number;
  resource_name: string;
  quantity: number;
  workspace: number;
}
