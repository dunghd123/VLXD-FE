import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';
import { Role } from '../../core/auth/models/auth.models';

@Directive({
  selector: '[appRole]',
  standalone: true
})
export class RoleDirective implements OnInit {
  @Input() appRole: Role[] = [];
  @Input() appRoleElse?: TemplateRef<any>;

  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.updateView();
    });
  }

  private updateView() {
    const hasRole = this.checkRole();
    
    if (hasRole && !this.hasView) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
      
      if (this.appRoleElse) {
        this.viewContainer.createEmbeddedView(this.appRoleElse);
      }
    }
  }

  private checkRole(): boolean {
    if (!this.appRole || this.appRole.length === 0) {
      return true;
    }

    const userRole = this.authService.getCurrentRole();
    return userRole ? this.appRole.includes(userRole) : false;
  }
}
