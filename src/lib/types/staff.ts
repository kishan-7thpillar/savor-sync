// Staff management system types

export interface Staff {
  id: string;
  organizationId: string;
  employeeId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  hireDate: Date;
  terminationDate?: Date;
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'on_leave';
  position: string;
  department: string;
  hourlyRate: number;
  salaryAnnual?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  profilePhotoUrl?: string;
  locations: StaffLocation[];
  roles: StaffRole[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffLocation {
  id: string;
  locationId: string;
  locationName: string;
  isPrimaryLocation: boolean;
  startDate: Date;
  endDate?: Date;
}

export interface StaffRole {
  id: string;
  roleName: string;
  permissions: Record<string, boolean>;
  locationId?: string;
  locationName?: string;
  isActive: boolean;
}

export interface StaffFormData {
  firstName: string;
  lastName: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  hireDate: Date;
  terminationDate?: Date;
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'on_leave';
  position: string;
  department: string;
  hourlyRate: number;
  salaryAnnual?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  profilePhotoUrl?: string;
  primaryLocationId: string;
  additionalLocationIds: string[];
  roles: {
    roleName: string;
    locationId?: string;
    permissions: Record<string, boolean>;
  }[];
}

export interface StaffMetrics {
  totalStaff: number;
  activeStaff: number;
  newHires: number;
  turnoverRate: number;
  averageHourlyRate: number;
  staffByDepartment: Record<string, number>;
  staffByPosition: Record<string, number>;
}

export interface LocationStaffData {
  locationId: string;
  locationName: string;
  staffCount: number;
  activeStaffCount: number;
  departments: Record<string, number>;
}

export interface DepartmentStaffData {
  department: string;
  staffCount: number;
  averageHourlyRate: number;
  positions: Record<string, number>;
}

export interface PerformanceMetrics {
  staffId: string;
  metrics: {
    customerRating?: number;
    salesPerformance?: number;
    attendanceRate?: number;
    efficiencyScore?: number;
    trainingCompletion?: number;
  };
  history: {
    period: string;
    metrics: Record<string, number>;
  }[];
}

export interface Shift {
  id: string;
  staffId: string;
  locationId: string;
  locationName: string;
  startTime: Date;
  endTime: Date;
  position: string;
  status: 'scheduled' | 'completed' | 'missed' | 'in_progress';
  notes?: string;
}
