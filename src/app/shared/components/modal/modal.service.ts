import { Injectable, Injector, ComponentRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { MODAL_DATA } from './modal.token';

export interface ModalConfig {
  data?: any; // dữ liệu truyền vào component
  size?: 'sm' | 'md' | 'lg' | 'xl'; // kích thước modal
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'; // vị trí modal
  theme?: 'default' | 'dark' | 'glass'; // theme modal
  backdrop?: boolean; // có backdrop hay không
  closeOnBackdropClick?: boolean; // đóng khi click backdrop
  closeOnEscape?: boolean; // đóng khi nhấn ESC
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private overlayRef?: OverlayRef;

  constructor(private overlay: Overlay, private injector: Injector) {}

  open<T>(component: any, config?: ModalConfig): ComponentRef<T> {
    // Add modal-open class to body
    document.body.classList.add('modal-open');
    
    // Default configuration
    const defaultConfig: ModalConfig = {
      size: 'md',
      position: 'center',
      theme: 'default',
      backdrop: true,
      closeOnBackdropClick: true,
      closeOnEscape: true,
      ...config
    };

    // Create overlay with configuration
    this.overlayRef = this.overlay.create({
      hasBackdrop: defaultConfig.backdrop,
      backdropClass: 'cdk-overlay-backdrop modal-backdrop',
      panelClass: this.getPanelClass(defaultConfig),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.getPositionStrategy(defaultConfig.position),
    });

    // Handle backdrop click
    if (defaultConfig.closeOnBackdropClick) {
      this.overlayRef.backdropClick().subscribe(() => this.close());
    }

    // Handle escape key
    if (defaultConfig.closeOnEscape) {
      document.addEventListener('keydown', this.handleEscapeKey.bind(this));
    }

    const injector = new PortalInjector(this.injector, new WeakMap([
      [MODAL_DATA, { ...defaultConfig.data, modalConfig: defaultConfig }]
    ]));

    const portal = new ComponentPortal(component, null, injector);
    return this.overlayRef.attach(portal) as ComponentRef<T>;
  }

  close() {
    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    
    // Remove escape key listener
    document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
    
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  private getPanelClass(config: ModalConfig): string[] {
    const classes = ['modal-panel'];
    
    if (config.size && config.size !== 'md') {
      classes.push(`modal-${config.size}`);
    }
    
    if (config.position && config.position !== 'center') {
      classes.push(`modal-${config.position}`);
    }
    
    if (config.theme && config.theme !== 'default') {
      classes.push(`modal-${config.theme}`);
    }
    
    return classes;
  }

  private getPositionStrategy(position: string | undefined) {
    const strategy = this.overlay.position().global();
    
    switch (position) {
      case 'top':
        return strategy.top('40px').centerHorizontally();
      case 'bottom':
        return strategy.bottom('40px').centerHorizontally();
      case 'left':
        return strategy.left('40px').centerVertically();
      case 'right':
        return strategy.right('40px').centerVertically();
      default: // center
        return strategy.centerHorizontally().centerVertically();
    }
  }

  private handleEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
