# User Vehicle Status API Usage

This API endpoint checks the current user's vehicle usage status and determines if they are currently using a vehicle or have overdue usage.

## API Endpoint

```
GET /api/user-status
```

## Authentication
- Requires user to be logged in
- Uses session-based authentication

## Response Format

```typescript
interface UserVehicleStatus {
  isUsingVehicle: boolean;     // True if currently within usage time range
  isOverlapping: boolean;      // True if usage is overdue (past end time)
  currentUsage?: {             // Present if isUsingVehicle is true
    id: string;
    vehicleName: string;
    vehiclePlate: string;
    startDateTime: string;
    endDateTime: string;
    destination: string;
  };
  overdueUsage?: {             // Present if isOverlapping is true
    id: string;
    vehicleName: string;
    vehiclePlate: string;
    startDateTime: string;
    endDateTime: string;
    destination: string;
    minutesOverdue: number;
  };
}
```

## Logic Explanation

### `isUsingVehicle` is `true` when:
- User has an approved request
- Current time is **within** the usage time range: `startDateTime <= now <= endDateTime`
- The request hasn't been checked out yet (`checkOutAt` is null)

### `isOverlapping` is `true` when:
- User has an approved request
- Current time is **after** the end time: `now >= endDateTime`
- The request hasn't been checked out yet (`checkOutAt` is null)

## Usage Examples

### Basic API Call
```javascript
const response = await fetch('/api/user-status');
const data = await response.json();

if (data.isUsingVehicle) {
  console.log('User is currently using:', data.currentUsage.vehicleName);
}

if (data.isOverlapping) {
  console.log('User has overdue usage:', data.overdueUsage.minutesOverdue, 'minutes');
}
```

### React Component Integration
```jsx
import { useEffect, useState, useCallback } from 'react';

function Dashboard() {
  const [isUsingVehicle, setIsUsingVehicle] = useState(false);
  const [isOverlapping, setIsOverlapping] = useState(false);

  const fetchUserStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/user-status');
      if (response.ok) {
        const data = await response.json();
        setIsUsingVehicle(data.isUsingVehicle);
        setIsOverlapping(data.isOverlapping);
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserStatus();
    
    // Update status every minute for real-time changes
    const interval = setInterval(fetchUserStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchUserStatus]);

  return (
    <div>
      {isUsingVehicle && <CheckOut type="inrange" />}
      {isOverlapping && <CheckOut type="outrange" />}
    </div>
  );
}
```

## Response Examples

### User Currently Using Vehicle
```json
{
  "isUsingVehicle": true,
  "isOverlapping": false,
  "currentUsage": {
    "id": "req123",
    "vehicleName": "Toyota Avanza",
    "vehiclePlate": "B 1234 XYZ",
    "startDateTime": "2024-01-15 09:00:00",
    "endDateTime": "2024-01-15 17:00:00",
    "destination": "Meeting with client"
  }
}
```

### User Has Overdue Usage
```json
{
  "isUsingVehicle": false,
  "isOverlapping": true,
  "overdueUsage": {
    "id": "req456",
    "vehicleName": "Honda CR-V",
    "vehiclePlate": "B 5678 ABC",
    "startDateTime": "2024-01-15 08:00:00",
    "endDateTime": "2024-01-15 16:00:00",
    "destination": "Site visit",
    "minutesOverdue": 45
  }
}
```

### No Active Usage
```json
{
  "isUsingVehicle": false,
  "isOverlapping": false
}
```

## Real-time Updates

The API should be called periodically to ensure real-time status updates:

```javascript
// Update every minute
const interval = setInterval(fetchUserStatus, 60000);

// Update when user performs actions
const handleSearch = () => {
  fetchVehicleRequests();
  fetchUserStatus(); // Refresh status
};
```

## Error Handling

```javascript
const fetchUserStatus = async () => {
  try {
    const response = await fetch('/api/user-status');
    
    if (!response.ok) {
      if (response.status === 401) {
        // User not authenticated
        router.push('/login');
        return;
      }
      throw new Error('Failed to fetch user status');
    }
    
    const data = await response.json();
    setIsUsingVehicle(data.isUsingVehicle);
    setIsOverlapping(data.isOverlapping);
    
  } catch (error) {
    console.error('Error fetching user status:', error);
    // Handle error appropriately
  }
};
```

## Use Cases

1. **Dashboard Display**: Show checkout options when user is using/overdue
2. **Restriction Logic**: Prevent new bookings if user has active usage
3. **Notifications**: Alert users about overdue returns
4. **Admin Monitoring**: Track vehicle usage compliance
5. **Automated Checkout**: Trigger automatic checkout processes

## Database Queries

The API performs the following database query:

```sql
SELECT vr.*, v.name, v.plate 
FROM vehicle_requests vr
JOIN vehicles v ON vr.vehicle_id = v.id
WHERE vr.user_id = ? 
  AND vr.status = 'APPROVED' 
  AND vr.check_out_at IS NULL
ORDER BY vr.start_date_time ASC
```

## Performance Notes

- Uses indexed queries on `user_id`, `status`, and `check_out_at`
- Returns early when status is determined
- Lightweight response payload
- Suitable for frequent polling (every minute)
