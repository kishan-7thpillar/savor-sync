import { NextRequest, NextResponse } from "next/server";

const SQUARE_API_URL = "https://connect.squareupsandbox.com/v2/team-members";
const SQUARE_VERSION = "2025-07-16";
const SQUARE_ACCESS_TOKEN =
  process.env.SQUARE_ACCESS_TOKEN ||
  "EAAAl4W2NSeUXRHo4AhPsep9jdnOfxSeQ95sAoejuSzwbdxUFyU2Ye2npf8Pv7Cy";

export async function GET(request: NextRequest) {
  try {
    // Hardcoded Square team member data
    const data = {
      team_members: [
        {
          id: "A1BxC23dEfGh45IjKlMn",
          reference_id: "ref1001",
          is_owner: false,
          status: "ACTIVE",
          given_name: "Emma",
          family_name: "Watson",
          email_address: "emma_watson@example.com",
          phone_number: "+14155552701",
          created_at: "2020-05-01T10:15:00Z",
          updated_at: "2020-06-01T12:20:00Z",
          assigned_locations: {
            assignment_type: "ALL_CURRENT_AND_FUTURE_LOCATIONS",
          },
          wage_setting: {
            team_member_id: "A1BxC23dEfGh45IjKlMn",
            job_assignments: [
              {
                job_title: "Barista",
                job_id: "JID101",
                pay_type: "HOURLY",
                hourly_rate: {
                  amount: 2200,
                  currency: "USD",
                },
              },
            ],
            is_overtime_exempt: false,
            version: 1,
            created_at: "2020-05-01T10:15:00Z",
            updated_at: "2020-05-01T10:15:00Z",
          },
        },
        {
          id: "B2CdE34fGhIj56KlMnOp",
          reference_id: "ref1002",
          is_owner: false,
          status: "ACTIVE",
          given_name: "Oliver",
          family_name: "Brown",
          created_at: "2020-06-10T09:30:00Z",
          updated_at: "2020-06-12T09:40:00Z",
          assigned_locations: {
            assignment_type: "ALL_CURRENT_AND_FUTURE_LOCATIONS",
          },
        },
        {
          id: "C3DeF45gHiJk67LmNoPq",
          reference_id: "ref1003",
          is_owner: false,
          status: "ACTIVE",
          given_name: "Sophia",
          family_name: "Williams",
          email_address: "sophia_williams@example.com",
          created_at: "2020-07-15T08:25:00Z",
          updated_at: "2020-07-15T09:00:00Z",
          assigned_locations: {
            assignment_type: "ALL_CURRENT_AND_FUTURE_LOCATIONS",
          },
        },
        {
          id: "D4EfG56hIjKl78MnOpQr",
          reference_id: "ref1004",
          is_owner: false,
          status: "ACTIVE",
          given_name: "Liam",
          family_name: "Davis",
          phone_number: "+14155552702",
          created_at: "2020-08-05T15:45:00Z",
          updated_at: "2020-08-06T10:00:00Z",
          assigned_locations: {
            assignment_type: "ALL_CURRENT_AND_FUTURE_LOCATIONS",
          },
          wage_setting: {
            team_member_id: "D4EfG56hIjKl78MnOpQr",
            job_assignments: [
              {
                job_title: "Chef",
                job_id: "JID102",
                pay_type: "SALARY",
                annual_rate: {
                  amount: 5000000,
                  currency: "USD",
                },
                weekly_hours: 45,
              },
            ],
            is_overtime_exempt: true,
            version: 1,
            created_at: "2020-08-05T15:45:00Z",
            updated_at: "2020-08-05T15:45:00Z",
          },
        },
        {
          id: "E5FgH67iJkLm89NoPqRs",
          reference_id: "ref1005",
          is_owner: false,
          status: "ACTIVE",
          given_name: "Isabella",
          family_name: "Miller",
          created_at: "2020-09-01T11:00:00Z",
          updated_at: "2020-09-01T11:05:00Z",
          assigned_locations: {
            assignment_type: "ALL_CURRENT_AND_FUTURE_LOCATIONS",
          },
        },
        {
          id: "F6GhI78jKlMn90OpQrSt",
          reference_id: "ref1006",
          is_owner: false,
          status: "ACTIVE",
          given_name: "James",
          family_name: "Wilson",
          email_address: "james_wilson@example.com",
          phone_number: "+14155552703",
          created_at: "2020-10-11T13:10:00Z",
          updated_at: "2020-10-11T13:15:00Z",
          assigned_locations: {
            assignment_type: "ALL_CURRENT_AND_FUTURE_LOCATIONS",
          },
          wage_setting: {
            team_member_id: "F6GhI78jKlMn90OpQrSt",
            job_assignments: [
              {
                job_title: "Cashier",
                job_id: "JID103",
                pay_type: "HOURLY",
                hourly_rate: {
                  amount: 2100,
                  currency: "USD",
                },
              },
            ],
            is_overtime_exempt: false,
            version: 1,
            created_at: "2020-10-11T13:10:00Z",
            updated_at: "2020-10-11T13:10:00Z",
          },
        },
        {
          id: "G7HiJ89kLmNo01PqRsTu",
          reference_id: "ref1007",
          is_owner: false,
          status: "ACTIVE",
          given_name: "Mia",
          family_name: "Taylor",
          created_at: "2020-11-20T14:00:00Z",
          updated_at: "2020-11-20T14:30:00Z",
          assigned_locations: {
            assignment_type: "ALL_CURRENT_AND_FUTURE_LOCATIONS",
          },
        },
        {
          id: "H8IjK90lMnOp12QrStUv",
          reference_id: "ref1008",
          is_owner: false,
          status: "ACTIVE",
          given_name: "Ethan",
          family_name: "Anderson",
          email_address: "ethan_anderson@example.com",
          phone_number: "+14155552704",
          created_at: "2020-12-05T10:20:00Z",
          updated_at: "2020-12-05T10:40:00Z",
          assigned_locations: {
            assignment_type: "ALL_CURRENT_AND_FUTURE_LOCATIONS",
          },
        },
        {
          id: "I9JkL01mNoPq23RsTuVw",
          reference_id: "ref1009",
          is_owner: false,
          status: "ACTIVE",
          given_name: "Charlotte",
          family_name: "Moore",
          created_at: "2021-01-10T16:10:00Z",
          updated_at: "2021-01-10T16:15:00Z",
          assigned_locations: {
            assignment_type: "ALL_CURRENT_AND_FUTURE_LOCATIONS",
          },
        },
        {
          id: "J0KlM12nOpQr34StUvWx",
          reference_id: "ref1010",
          is_owner: false,
          status: "ACTIVE",
          given_name: "Benjamin",
          family_name: "Thomas",
          email_address: "benjamin_thomas@example.com",
          phone_number: "+14155552705",
          created_at: "2021-02-14T09:00:00Z",
          updated_at: "2021-02-14T09:30:00Z",
          assigned_locations: {
            assignment_type: "ALL_CURRENT_AND_FUTURE_LOCATIONS",
          },
          wage_setting: {
            team_member_id: "J0KlM12nOpQr34StUvWx",
            job_assignments: [
              {
                job_title: "Waiter",
                job_id: "JID104",
                pay_type: "HOURLY",
                hourly_rate: {
                  amount: 1900,
                  currency: "USD",
                },
              },
            ],
            is_overtime_exempt: false,
            version: 1,
            created_at: "2021-02-14T09:00:00Z",
            updated_at: "2021-02-14T09:00:00Z",
          },
        },
      ],
      cursor: "N:9UglUjOXQ13-hMFypCft",
    };

    const processedData = processTeamMemberData(data.team_members || []);

    return NextResponse.json({
      success: true,
      data: processedData,
      cursor: data.cursor,
      raw: data,
    });
  } catch (error) {
    console.error("Error processing team members:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

function processTeamMemberData(teamMembers: any[]) {
  const processedStaff = teamMembers.map((member) => ({
    // Square fields
    id: member.id,
    reference_id: member.reference_id,
    is_owner: member.is_owner,
    status: member.status,
    given_name: member.given_name,
    family_name: member.family_name,
    email_address: member.email_address,
    phone_number: member.phone_number,
    created_at: member.created_at,
    updated_at: member.updated_at,
    assigned_locations: member.assigned_locations,
    wage_setting: member.wage_setting,

    // Transformed fields for compatibility
    firstName: member.given_name,
    lastName: member.family_name,
    email: member.email_address || "No email",
    phone: member.phone_number || "No phone",
    fullName:
      `${member.given_name || ""} ${member.family_name || ""}`.trim() ||
      "Unknown",
    employmentStatus: member.status === "ACTIVE" ? "active" : "inactive",
    joinDate: new Date(member.created_at).toLocaleDateString(),

    // Job information from wage_setting
    position:
      member.wage_setting?.job_assignments?.[0]?.job_title || "No position",
    department: "General", // Square doesn't have department concept

    // Wage information
    hourlyRate: member.wage_setting?.job_assignments?.[0]?.hourly_rate?.amount
      ? member.wage_setting.job_assignments[0].hourly_rate.amount / 100 // Convert cents to dollars
      : null,
    salaryAnnual: member.wage_setting?.job_assignments?.[0]?.annual_rate?.amount
      ? member.wage_setting.job_assignments[0].annual_rate.amount / 100 // Convert cents to dollars
      : null,
    payType: member.wage_setting?.job_assignments?.[0]?.pay_type || "HOURLY",

    // Location assignment
    locationAssignment:
      member.assigned_locations?.assignment_type ||
      "ALL_CURRENT_AND_FUTURE_LOCATIONS",

    // Job assignments
    jobAssignments: member.wage_setting?.job_assignments || [],

    // Additional computed fields
    isOvertimeExempt: member.wage_setting?.is_overtime_exempt || false,
    weeklyHours:
      member.wage_setting?.job_assignments?.[0]?.weekly_hours || null,
  }));

  // Calculate staff metrics
  const metrics = {
    totalStaff: processedStaff.length,
    activeStaff: processedStaff.filter((s) => s.status === "ACTIVE").length,
    inactiveStaff: processedStaff.filter((s) => s.status !== "ACTIVE").length,
    managersCount: processedStaff.filter((s) =>
      s.position?.toLowerCase().includes("manager")
    ).length,
    cashiersCount: processedStaff.filter((s) =>
      s.position?.toLowerCase().includes("cashier")
    ).length,
    averageHourlyRate: calculateAverageHourlyRate(processedStaff),
  };

  // Group by position for analytics
  const positionGroups = processedStaff.reduce((acc, staff) => {
    const position = staff.position || "Unknown";
    if (!acc[position]) {
      acc[position] = 0;
    }
    acc[position]++;
    return acc;
  }, {} as Record<string, number>);

  // Group by status
  const statusGroups = processedStaff.reduce((acc, staff) => {
    const status = staff.status || "Unknown";
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status]++;
    return acc;
  }, {} as Record<string, number>);

  return {
    staff: processedStaff,
    metrics,
    analytics: {
      byPosition: Object.entries(positionGroups).map(([position, count]) => ({
        name: position,
        count,
        percentage: Math.round((count / processedStaff.length) * 100),
      })),
      byStatus: Object.entries(statusGroups).map(([status, count]) => ({
        name: status,
        count,
        percentage: Math.round((count / processedStaff.length) * 100),
      })),
    },
  };
}

function calculateAverageHourlyRate(staff: any[]): number {
  const hourlyRates = staff
    .filter((s) => s.hourlyRate && s.hourlyRate > 0)
    .map((s) => s.hourlyRate);

  if (hourlyRates.length === 0) return 0;

  return (
    Math.round(
      (hourlyRates.reduce((sum, rate) => sum + rate, 0) / hourlyRates.length) *
        100
    ) / 100
  );
}
