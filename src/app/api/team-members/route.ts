import { NextRequest, NextResponse } from "next/server";

// Mock data for staff management
const MOCK_STAFF_DATA = {
  shifts: [
    // August 24, 2025 shifts
    {
      id: "shift_12345678901234567880",
      employee_id: "emp_abc123def456ghi789",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-24T09:00:00Z",
      end_at: "2025-08-24T17:00:00Z",
      wage: {
        title: "Manager",
        hourly_rate: {
          amount: 2500,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-24T09:00:00Z",
      updated_at: "2025-08-24T17:05:00Z",
      team_member_id: "tm_jkl789mno012pqr345",
      declared_cash_tip_money: {
        amount: 1100,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_024_001",
          start_at: "2025-08-24T13:00:00Z",
          end_at: "2025-08-24T13:30:00Z",
          break_type: "PAID",
          name: "Lunch Break",
          expected_duration: "PT30M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567881",
      employee_id: "emp_def456ghi789jkl012",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-24T10:00:00Z",
      end_at: "2025-08-24T18:00:00Z",
      wage: {
        title: "Server",
        hourly_rate: {
          amount: 1500,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-24T10:00:00Z",
      updated_at: "2025-08-24T18:05:00Z",
      team_member_id: "tm_stu456vwx789yza012",
      declared_cash_tip_money: {
        amount: 2100,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_024_002",
          start_at: "2025-08-24T14:00:00Z",
          end_at: "2025-08-24T14:15:00Z",
          break_type: "PAID",
          name: "Short Break",
          expected_duration: "PT15M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567882",
      employee_id: "emp_ghi789jkl012mno345",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-24T11:00:00Z",
      end_at: "2025-08-24T19:00:00Z",
      wage: {
        title: "Kitchen Staff",
        hourly_rate: {
          amount: 1800,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-24T11:00:00Z",
      updated_at: "2025-08-24T19:05:00Z",
      team_member_id: "tm_bcd345efg678hij901",
      declared_cash_tip_money: {
        amount: 280,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_024_003",
          start_at: "2025-08-24T15:00:00Z",
          end_at: "2025-08-24T15:30:00Z",
          break_type: "PAID",
          name: "Lunch Break",
          expected_duration: "PT30M",
          is_paid: true,
        },
      ],
    },
    // August 25, 2025 shifts
    {
      id: "shift_12345678901234567883",
      employee_id: "emp_abc123def456ghi789",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-25T09:00:00Z",
      end_at: "2025-08-25T17:00:00Z",
      wage: {
        title: "Manager",
        hourly_rate: {
          amount: 2500,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-25T09:00:00Z",
      updated_at: "2025-08-25T17:05:00Z",
      team_member_id: "tm_jkl789mno012pqr345",
      declared_cash_tip_money: {
        amount: 1350,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_025_001",
          start_at: "2025-08-25T13:00:00Z",
          end_at: "2025-08-25T13:30:00Z",
          break_type: "PAID",
          name: "Lunch Break",
          expected_duration: "PT30M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567884",
      employee_id: "emp_def456ghi789jkl012",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-25T10:00:00Z",
      end_at: "2025-08-25T18:00:00Z",
      wage: {
        title: "Server",
        hourly_rate: {
          amount: 1500,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-25T10:00:00Z",
      updated_at: "2025-08-25T18:05:00Z",
      team_member_id: "tm_stu456vwx789yza012",
      declared_cash_tip_money: {
        amount: 1950,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_025_002",
          start_at: "2025-08-25T14:00:00Z",
          end_at: "2025-08-25T14:15:00Z",
          break_type: "PAID",
          name: "Short Break",
          expected_duration: "PT15M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567885",
      employee_id: "emp_ghi789jkl012mno345",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-25T11:00:00Z",
      end_at: "2025-08-25T19:00:00Z",
      wage: {
        title: "Kitchen Staff",
        hourly_rate: {
          amount: 1800,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-25T11:00:00Z",
      updated_at: "2025-08-25T19:05:00Z",
      team_member_id: "tm_bcd345efg678hij901",
      declared_cash_tip_money: {
        amount: 320,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_025_003",
          start_at: "2025-08-25T15:00:00Z",
          end_at: "2025-08-25T15:30:00Z",
          break_type: "PAID",
          name: "Lunch Break",
          expected_duration: "PT30M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567890",
      employee_id: "emp_abc123def456ghi789",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-26T09:00:00Z",
      end_at: "2025-08-26T17:00:00Z",
      wage: {
        title: "Manager",
        hourly_rate: {
          amount: 2500,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-26T09:00:00Z",
      updated_at: "2025-08-26T17:05:00Z",
      team_member_id: "tm_jkl789mno012pqr345",
      declared_cash_tip_money: {
        amount: 1200,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_001",
          start_at: "2025-08-26T13:00:00Z",
          end_at: "2025-08-26T13:30:00Z",
          break_type: "PAID",
          name: "Lunch Break",
          expected_duration: "PT30M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567891",
      employee_id: "emp_abc123def456ghi789",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-27T09:00:00Z",
      end_at: "2025-08-27T17:00:00Z",
      wage: {
        title: "Manager",
        hourly_rate: {
          amount: 2500,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-27T09:00:00Z",
      updated_at: "2025-08-27T17:05:00Z",
      team_member_id: "tm_jkl789mno012pqr345",
      declared_cash_tip_money: {
        amount: 800,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_002",
          start_at: "2025-08-27T13:00:00Z",
          end_at: "2025-08-27T13:30:00Z",
          break_type: "PAID",
          name: "Lunch Break",
          expected_duration: "PT30M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567892",
      employee_id: "emp_abc123def456ghi789",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-28T09:00:00Z",
      end_at: "2025-08-28T17:00:00Z",
      wage: {
        title: "Manager",
        hourly_rate: {
          amount: 2500,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-28T09:00:00Z",
      updated_at: "2025-08-28T17:05:00Z",
      team_member_id: "tm_jkl789mno012pqr345",
      declared_cash_tip_money: {
        amount: 950,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_003",
          start_at: "2025-08-28T13:00:00Z",
          end_at: "2025-08-28T13:30:00Z",
          break_type: "PAID",
          name: "Lunch Break",
          expected_duration: "PT30M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567893",
      employee_id: "emp_def456ghi789jkl012",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-26T10:00:00Z",
      end_at: "2025-08-26T18:00:00Z",
      wage: {
        title: "Server",
        hourly_rate: {
          amount: 1500,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-26T10:00:00Z",
      updated_at: "2025-08-26T18:05:00Z",
      team_member_id: "tm_stu456vwx789yza012",
      declared_cash_tip_money: {
        amount: 2200,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_004",
          start_at: "2025-08-26T14:00:00Z",
          end_at: "2025-08-26T14:15:00Z",
          break_type: "PAID",
          name: "Short Break",
          expected_duration: "PT15M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567894",
      employee_id: "emp_def456ghi789jkl012",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-27T10:00:00Z",
      end_at: "2025-08-27T18:00:00Z",
      wage: {
        title: "Server",
        hourly_rate: {
          amount: 1500,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-27T10:00:00Z",
      updated_at: "2025-08-27T18:05:00Z",
      team_member_id: "tm_stu456vwx789yza012",
      declared_cash_tip_money: {
        amount: 1800,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_005",
          start_at: "2025-08-27T14:00:00Z",
          end_at: "2025-08-27T14:15:00Z",
          break_type: "PAID",
          name: "Short Break",
          expected_duration: "PT15M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567895",
      employee_id: "emp_def456ghi789jkl012",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-29T10:00:00Z",
      end_at: "2025-08-29T18:00:00Z",
      wage: {
        title: "Server",
        hourly_rate: {
          amount: 1500,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-29T10:00:00Z",
      updated_at: "2025-08-29T18:05:00Z",
      team_member_id: "tm_stu456vwx789yza012",
      declared_cash_tip_money: {
        amount: 2400,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_006",
          start_at: "2025-08-29T14:00:00Z",
          end_at: "2025-08-29T14:15:00Z",
          break_type: "PAID",
          name: "Short Break",
          expected_duration: "PT15M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567896",
      employee_id: "emp_ghi789jkl012mno345",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-26T11:00:00Z",
      end_at: "2025-08-26T19:00:00Z",
      wage: {
        title: "Kitchen Staff",
        hourly_rate: {
          amount: 1800,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-26T11:00:00Z",
      updated_at: "2025-08-26T19:05:00Z",
      team_member_id: "tm_bcd345efg678hij901",
      declared_cash_tip_money: {
        amount: 300,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_007",
          start_at: "2025-08-26T15:00:00Z",
          end_at: "2025-08-26T15:30:00Z",
          break_type: "PAID",
          name: "Lunch Break",
          expected_duration: "PT30M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567897",
      employee_id: "emp_ghi789jkl012mno345",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-28T11:00:00Z",
      end_at: "2025-08-28T19:00:00Z",
      wage: {
        title: "Kitchen Staff",
        hourly_rate: {
          amount: 1800,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-28T11:00:00Z",
      updated_at: "2025-08-28T19:05:00Z",
      team_member_id: "tm_bcd345efg678hij901",
      declared_cash_tip_money: {
        amount: 450,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_008",
          start_at: "2025-08-28T15:00:00Z",
          end_at: "2025-08-28T15:30:00Z",
          break_type: "PAID",
          name: "Lunch Break",
          expected_duration: "PT30M",
          is_paid: true,
        },
      ],
    },
    {
      id: "shift_12345678901234567898",
      employee_id: "emp_ghi789jkl012mno345",
      location_id: "L2GWD4HSU8HXP",
      timezone: "America/New_York",
      start_at: "2025-08-30T11:00:00Z",
      end_at: "2025-08-30T19:00:00Z",
      wage: {
        title: "Kitchen Staff",
        hourly_rate: {
          amount: 1800,
          currency: "USD",
        },
      },
      status: "CLOSED",
      version: 1,
      created_at: "2025-08-30T11:00:00Z",
      updated_at: "2025-08-30T19:05:00Z",
      team_member_id: "tm_bcd345efg678hij901",
      declared_cash_tip_money: {
        amount: 520,
        currency: "USD",
      },
      breaks: [
        {
          id: "break_009",
          start_at: "2025-08-30T15:00:00Z",
          end_at: "2025-08-30T15:30:00Z",
          break_type: "PAID",
          name: "Lunch Break",
          expected_duration: "PT30M",
          is_paid: true,
        },
      ],
    },
  ],
  workweeks: [
    {
      id: "workweek_2025_34",
      start_date: "2025-08-26",
      end_date: "2025-09-01",
      version: 1,
    },
  ],
  team_members: [
    {
      id: "tm_jkl789mno012pqr345",
      is_owner: false,
      status: "ACTIVE",
      given_name: "Sarah",
      family_name: "Johnson",
      email_address: "sarah.johnson@restaurant.com",
      phone_number: "+12345678901",
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-08-25T14:20:00Z",
    },
    {
      id: "tm_stu456vwx789yza012",
      is_owner: false,
      status: "ACTIVE",
      given_name: "Mike",
      family_name: "Davis",
      email_address: "mike.davis@restaurant.com",
      phone_number: "+12345678902",
      created_at: "2025-02-20T09:15:00Z",
      updated_at: "2025-08-25T16:45:00Z",
    },
    {
      id: "tm_bcd345efg678hij901",
      is_owner: false,
      status: "ACTIVE",
      given_name: "Emily",
      family_name: "Rodriguez",
      email_address: "emily.rodriguez@restaurant.com",
      phone_number: "+12345678903",
      created_at: "2025-03-10T11:00:00Z",
      updated_at: "2025-08-25T13:30:00Z",
    },
  ],
  cursor: "eyJzaGlmdF9pZCI6InNoaWZ0XzEyMzQ1Njc4OTAxMjM0NTY3ODk4In0=",
};

export async function GET(request: NextRequest) {
  try {
    // Process the team members data from mock data
    const processedTeamMembers = processTeamMembers(
      MOCK_STAFF_DATA.team_members
    );

    // Add shift data and calculate metrics
    const teamMembersWithShifts = addShiftData(
      processedTeamMembers,
      MOCK_STAFF_DATA.shifts
    );

    return NextResponse.json({
      success: true,
      data: teamMembersWithShifts,
      shifts: MOCK_STAFF_DATA.shifts,
      workweeks: MOCK_STAFF_DATA.workweeks,
    });
  } catch (error) {
    console.error("Error processing team members:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch team members",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function processTeamMembers(teamMembers: any[]) {
  return teamMembers.map((member) => {
    return {
      id: member.id,
      name: `${member.given_name} ${member.family_name}`.trim(),
      email: member.email_address,
      phone: member.phone_number,
      status: member.status,
      isOwner: member.is_owner,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
    };
  });
}

function addShiftData(teamMembers: any[], shifts: any[]) {
  return teamMembers.map((member) => {
    // Get shifts for this team member
    const memberShifts = shifts.filter(
      (shift) => shift.team_member_id === member.id
    );

    // Get the role from the first shift (they should all be the same)
    const role = memberShifts.length > 0 ? memberShifts[0].wage.title : "Staff";
    const hourlyRate =
      memberShifts.length > 0
        ? memberShifts[0].wage.hourly_rate.amount / 100
        : 0;

    // Calculate shift metrics
    const totalHours = memberShifts.reduce((total, shift) => {
      const startTime = new Date(shift.start_at);
      const endTime = new Date(shift.end_at);
      const hours =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      // Subtract break time
      const breakTime =
        shift.breaks?.reduce((breakTotal: number, breakItem: any) => {
          const breakStart = new Date(breakItem.start_at);
          const breakEnd = new Date(breakItem.end_at);
          return (
            breakTotal +
            (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60)
          );
        }, 0) || 0;

      return total + (hours - breakTime);
    }, 0);

    const totalCost = memberShifts.reduce((total, shift) => {
      const startTime = new Date(shift.start_at);
      const endTime = new Date(shift.end_at);
      const hours =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      // Subtract break time
      const breakTime =
        shift.breaks?.reduce((breakTotal: number, breakItem: any) => {
          const breakStart = new Date(breakItem.start_at);
          const breakEnd = new Date(breakItem.end_at);
          return (
            breakTotal +
            (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60)
          );
        }, 0) || 0;

      const workHours = hours - breakTime;
      const hourlyRate = shift.wage.hourly_rate.amount / 100;
      return total + workHours * hourlyRate;
    }, 0);

    const totalTips = memberShifts.reduce((total, shift) => {
      return total + (shift.declared_cash_tip_money?.amount || 0) / 100;
    }, 0);

    return {
      ...member,
      role,
      hourlyRate,
      payType: "HOURLY",
      shifts: memberShifts,
      shiftMetrics: {
        totalShifts: memberShifts.length,
        totalHours: Math.round(totalHours * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalTips: Math.round(totalTips * 100) / 100,
        averageShiftLength:
          memberShifts.length > 0
            ? Math.round((totalHours / memberShifts.length) * 100) / 100
            : 0,
      },
    };
  });
}
