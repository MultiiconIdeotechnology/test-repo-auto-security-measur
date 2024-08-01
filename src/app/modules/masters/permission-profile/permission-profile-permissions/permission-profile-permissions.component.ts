import { Linq } from 'app/utils/linq';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { Component, } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermissionProfileService } from 'app/services/permission-profile.service';
import { PermissionService } from 'app/services/permission.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

export class TodoItemFlatNode {
    name: string;
    level: number;
    expandable: boolean;
}

interface TreeNode {
    name: string;
    isSelected: boolean;
    children?: TreeNode[];
}

@Component({
    selector: 'app-permission-profile-permissions',
    templateUrl: './permission-profile-permissions.component.html',
    styleUrls: ['./permission-profile-permissions.component.scss'],
    standalone: true,
    imports: [
        RouterLink,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatDividerModule,
        MatButtonModule,
        MatTreeModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatDatepickerModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatTableModule,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule,
    ],
})
export class PermissionProfilePermissionsComponent {

    public permissionProfile: any = {};
    public dataSource: any;
    public selectedDataSource: any;
    public permissionArray = [];
    public permissionArrayDisplay = [];
    public selectedPermissionArray = [];
    public selectedPermissionArrayDisplay = [];
    public selectedPermissionSearch: FormControl;
    public permissionSearch: FormControl;

    checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);
    public treeControl: FlatTreeControl<any>;

    public hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

    constructor(
        private permissionProfileService: PermissionProfileService,
        private permissionService: PermissionService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.treeControl = new NestedTreeControl<any>(node => node.children);
        this.dataSource = new MatTreeNestedDataSource<any>();
        this.selectedDataSource = new MatTreeNestedDataSource<any>();

        this.selectedPermissionSearch = new FormControl();
        this.permissionSearch = new FormControl();
    }

    ngOnInit(): void {
        this.permissionSearch.valueChanges.subscribe((value: string) => {
            if (typeof value === 'string') {
                value = value.toLowerCase();
                this.permissionArrayDisplay = this.permissionArray
                    .filter(
                        x => x.module_name.toLowerCase().includes(value) ||
                            x.group_name.toLowerCase().includes(value) ||
                            x.operation_type.toLowerCase().includes(value) ||
                            x.category_name.toLowerCase().includes(value)
                    );
            } else {
                this.permissionArrayDisplay = this.permissionArray;
            }
            this.buildPTree();
        });

        this.selectedPermissionSearch.valueChanges.subscribe((value: string) => {
            if (typeof value === 'string') {
                value = value.toLowerCase();
                this.selectedPermissionArrayDisplay = this.selectedPermissionArray
                    .filter(
                        x => x.module_name.toLowerCase().includes(value) ||
                            x.group_name.toLowerCase().includes(value) ||
                            x.operation_type.toLowerCase().includes(value) ||
                            x.category_name.toLowerCase().includes(value)
                    );
            } else {
                this.selectedPermissionArrayDisplay = this.selectedPermissionArray;
            }
            this.buildTree();
        });

        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (!id) {
                return;
            }

            this.permissionProfileService.getPermissionProfileRecord(id).subscribe(jr => this.permissionProfile = jr);
            this.permissionService.getAllPermission().subscribe(p => {
                this.permissionArray = p;
                this.permissionArrayDisplay = p;
                this.buildPTree();
            });
            this.permissionProfileService.getPermissionListByPermissionProfile(id).subscribe(p => {

                this.selectedPermissionArray = p;
                this.selectedPermissionArrayDisplay = p;
                if (this.selectedPermissionArray.length === 0) {
                    this.addDefaultPermissions();
                }
                this.buildTree();
            });
        });
    }

    public addDefaultPermissions(): void {
        this.permissionArray.filter(x => x.is_default)
            .forEach(x => this.selectedPermissionArray.push(Object.assign({}, x)));
        this.selectedPermissionArrayDisplay = this.selectedPermissionArray;
    }

    public buildPTree(): void {
        this.dataSource.data = Linq.select(Linq.groupBy(this.permissionArrayDisplay, (val: any) => val.module_name),
            (val: any) => ({
                name: val.key,
                children: Linq.select(Linq.groupBy<any, any>(val.value, (d: any) => d.group_name),
                    (c: any) => ({
                        name: c.key,
                        children: Linq.select(c.value, (n: any) => ({
                            name: n.operation_type,
                            children: [],
                            value: n
                        }))
                    }))
            })
        );
    }

    partiallySelected(node: TodoItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.checklistSelection.isSelected(child));
        return result && !this.allSelected(node);
    }


    toggleNodeSelection(node: TreeNode): void {
        node.isSelected = node.isSelected;
        this.checkChildren(node, node.isSelected);
    }

    checkChildren(node: TreeNode, isSelected: boolean): void {
        if (node.children) {
            node.children.forEach(child => {
                child.isSelected = isSelected;
                this.checkChildren(child, isSelected);
            });
        }
    }

    allSelected(node: TodoItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        return descendants.every(child => this.checklistSelection.isSelected(child));
    }

    itemSelectionToggle(node: TodoItemFlatNode): void {
        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        this.checklistSelection.isSelected(node)
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants);
    }

    public buildTree(): void {
        this.selectedDataSource.data = Linq.select(Linq.groupBy(this.selectedPermissionArrayDisplay, (val: any) => val.module_name),
            (val: any) => ({
                name: val.key,
                children: Linq.select(Linq.groupBy<any, any>(val.value, (d: any) => d.group_name),
                    (c: any) => ({
                        name: c.key,
                        children: Linq.select(c.value, (n: any) => ({
                            name: n.operation_type,
                            children: [],
                            value: n
                        }))
                    }))
            })
        );
    }

    public addPermission(): void {
        if (!this.permissionArray || !this.selectedPermissionArray) {
            return;
        }

        const arr = this.permissionArray.filter(p => p.isSelected);

        for (const p of arr) {
            if (!this.selectedPermissionArray.find(x => x.id === p.id)) {
                const obj = Object.assign({}, p);
                obj.isSelected = false;
                p.isSelected = false;
                this.selectedPermissionArray.push(obj);
                this.selectedPermissionArrayDisplay = this.selectedPermissionArray;
            }
        }

        this.buildTree();
    }

    public addAllPermission(): void {
        this.selectedPermissionArray = [];
        this.permissionArray.forEach(x => this.selectedPermissionArray.push(Object.assign({}, x)));
        this.selectedPermissionArrayDisplay = this.selectedPermissionArray;
        this.buildTree();
    }

    public removePermission(): void {
        if (!this.selectedPermissionArray) {
            return;
        }

        const arr = this.selectedPermissionArray.filter(x => x.isSelected);

        for (const val of arr) {
            this.selectedPermissionArray.splice(this.selectedPermissionArray.indexOf(val), 1);
            this.selectedPermissionArrayDisplay = this.selectedPermissionArray;
        }

        this.buildTree();
    }

    public removeAllPermission(): void {
        this.selectedPermissionArray = [];
        this.selectedPermissionArrayDisplay = this.selectedPermissionArray;
        this.buildTree();
    }

    public save(): void {
        if (!this.selectedPermissionArray) {
            return;
        }

        const model = {
            permission_profile_id: this.permissionProfile.id,
            permissions: Linq.select(this.selectedPermissionArray, (val: any) => ({ permission_id: val.id }))
        };

        this.permissionProfileService.createPermission(model).subscribe(() => {
            // this.alertService.success('Permissions Saved');
            this.router.navigate(['/hr/permission-profile']);
        }, (err) => console.log('err'));
    }

}
