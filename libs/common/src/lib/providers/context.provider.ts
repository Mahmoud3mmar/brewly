import { ClsService } from 'nestjs-cls';

export class ContextProvider {
  private static clsService: ClsService;

  static setClsService(clsService: ClsService) {
    ContextProvider.clsService = clsService;
  }

  static setAuthUser(user: any) {
    ContextProvider.clsService?.set('authUser', user);
  }

  static getAuthUser(): any {
    return ContextProvider.clsService?.get('authUser');
  }

  static setAuthAdmin(admin: any) {
    ContextProvider.clsService?.set('authAdmin', admin);
  }

  static getAuthAdmin(): any {
    return ContextProvider.clsService?.get('authAdmin');
  }
}

