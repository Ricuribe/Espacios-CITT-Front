
export interface Workspace {
  id_workspace: number;
  name: string;
  space_type: string;
  description: string;
  max_occupancy: number;
  image: string;
  resources: Object[];
}
