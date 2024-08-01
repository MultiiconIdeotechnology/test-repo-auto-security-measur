import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { Shortcut } from 'app/layout/common/shortcuts/shortcuts.types';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'shortcuts',
    templateUrl: './shortcuts.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'shortcuts',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, NgIf, MatTooltipModule, NgFor, NgClass, NgTemplateOutlet, RouterLink, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatSelectModule, NgxMatSelectSearchModule],
})
export class ShortcutsComponent implements OnInit, OnDestroy, OnChanges {
    @ViewChild('shortcutsOrigin') private _shortcutsOrigin: MatButton;
    @ViewChild('shortcutsPanel') private _shortcutsPanel: TemplateRef<any>;

    mode: 'view' | 'modify' | 'add' | 'edit' = 'view';
    shortcutForm: UntypedFormGroup;
    shortcuts: Shortcut[] = [];
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @Input() navigation: FuseNavigationItem[] = [];

    shortcutfilter = new FormControl()
    filteredNavigation: FuseNavigationItem[] = [];

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _shortcutsService: ShortcutsService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Initialize the form
        this.shortcutForm = this._formBuilder.group({
            id: [null],
            label: ['', Validators.required],
            description: [''],
            icon: ['', Validators.required],
            link: ['', Validators.required],
            useRouter: [true, Validators.required],
            navigation: ['', Validators.required]
        });

        this.shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];

        this.shortcutfilter.valueChanges.subscribe((text: string) => {
            this.filteredNavigation = this.navigation.filter(x => x.title.toLowerCase().includes(text.toLowerCase()) || x.detail.toLowerCase().includes(text.toLowerCase()))
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        const change = changes.navigation;
        if (change) {
            this.filteredNavigation = this.navigation;
        }
    }

    navigationChanged(val: FuseNavigationItem): void {
        this.shortcutForm.get('id').patchValue(val.id);
        this.shortcutForm.get('label').patchValue(val.title);
        this.shortcutForm.get('description').patchValue(val.detail);
        this.shortcutForm.get('icon').patchValue(val.icon);
        this.shortcutForm.get('link').patchValue(val.link);
        this.shortcutForm.get('useRouter').patchValue(true);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if (this._overlayRef) {
            this._overlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the shortcuts panel
     */
    openPanel(): void {
        // Return if the shortcuts panel or its origin is not defined
        if (!this._shortcutsPanel || !this._shortcutsOrigin) {
            return;
        }

        // Make sure to start in 'view' mode
        this.mode = 'view';

        // Create the overlay if it doesn't exist
        if (!this._overlayRef) {
            this._createOverlay();
        }

        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._shortcutsPanel, this._viewContainerRef));
    }

    /**
     * Close the shortcuts panel
     */
    closePanel(): void {
        this._overlayRef.detach();
    }

    /**
     * Change the mode
     */
    changeMode(mode: 'view' | 'modify' | 'add' | 'edit'): void {
        // Change the mode
        this.mode = mode;
    }

    /**
     * Prepare for a new shortcut
     */
    newShortcut(): void {
        // Reset the form
        this.shortcutForm.reset();

        // Enter the add mode
        this.mode = 'add';
    }

    /**
     * Edit a shortcut
     */
    editShortcut(shortcut: Shortcut): void {
        // Reset the form with the shortcut
        this.shortcutForm.reset(shortcut);

        // Enter the edit mode
        this.mode = 'edit';
    }

    /**
     * Save shortcut
     */
    save(): void {
        // Get the data from the form
        const shortcut = this.shortcutForm.value;

        this.shortcuts.push(shortcut)

        localStorage.setItem('shortcuts', JSON.stringify(this.shortcuts));

        // Go back the modify mode
        this.mode = 'view';
    }

    /**
     * Delete shortcut
     */
    delete(shortCut: Shortcut): void {
        // Get the data from the form
        const index = this.shortcuts.indexOf(this.shortcuts.find(x => x.id === shortCut.id));

        this.shortcuts.splice(index, 1);

        localStorage.setItem('shortcuts', JSON.stringify(this.shortcuts));

    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the overlay
     */
    private _createOverlay(): void {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            hasBackdrop: true,
            backdropClass: 'fuse-backdrop-on-mobile',
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._shortcutsOrigin._elementRef.nativeElement)
                .withLockedPosition(true)
                .withPush(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                    {
                        originX: 'start',
                        originY: 'top',
                        overlayX: 'start',
                        overlayY: 'bottom',
                    },
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top',
                    },
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'bottom',
                    },
                ]),
        });

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() => {
            this._overlayRef.detach();
        });
    }
}
