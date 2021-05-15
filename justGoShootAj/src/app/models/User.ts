  export interface User  {
    name?: string;
    email?: string;
    phone?: string;
    admin?:  boolean;
    addr1?: string,
    addr2?: string,
    addr3?: string,
    eircode?: string,
    town?: string,
    county?: string,
    country?: string,
    token?: string,
    projects?:  Array<string>,
  }