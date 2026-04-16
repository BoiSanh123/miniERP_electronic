export const PARTNERS_REPOSITORY_PORT = Symbol("PARTNERS_REPOSITORY_PORT");

export interface IPartnersRepository {
  findByTaxCode(taxCode: string): Promise<any>;
  findById(id: string): Promise<any>;
  createPartner(data: any): Promise<any>;
}