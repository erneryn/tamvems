# Vehicle Return API Usage

This API endpoint handles vehicle returns by updating the request status to COMPLETED and setting the check_out_at timestamp.

## API Endpoint

```
POST /api/vehicle-return
```

## Authentication
- Requires user to be logged in
- Users can only return their own vehicles
- Vehicle request must be in APPROVED status

## Request Format

```typescript
{
  requestId: string; // Required: ID of the vehicle request to return
}
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "Kendaraan B 1234 XYZ berhasil dikembalikan",
  "data": {
    "id": "req123",
    "vehicleName": "Toyota Avanza",
    "vehiclePlate": "B 1234 XYZ",
    "checkOutAt": "2024-01-15T17:30:00.000Z",
    "status": "COMPLETED"
  }
}
```

### Error Responses
```json
// Unauthorized (401)
{
  "error": "Unauthorized"
}

// Request not found (404)
{
  "error": "Pengajuan tidak ditemukan"
}

// Not request owner (403)
{
  "error": "Anda tidak memiliki akses untuk mengembalikan kendaraan ini"
}

// Invalid status (400)
{
  "error": "Pengajuan harus dalam status disetujui untuk dapat dikembalikan"
}

// Already returned (400)
{
  "error": "Kendaraan sudah dikembalikan sebelumnya"
}
```

## Usage Examples

### Basic API Call
```javascript
const returnVehicle = async (requestId) => {
  try {
    const response = await fetch('/api/vehicle-return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId: requestId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message); // "Kendaraan B 1234 XYZ berhasil dikembalikan"
      return data;
    } else {
      const error = await response.json();
      console.error(error.error);
      throw new Error(error.error);
    }
  } catch (error) {
    console.error('Error returning vehicle:', error);
    throw error;
  }
};
```

### React Component Integration
```jsx
import { useState } from 'react';

function VehicleReturnButton({ requestId, onReturnSuccess }) {
  const [isReturning, setIsReturning] = useState(false);
  const [error, setError] = useState('');

  const handleReturn = async () => {
    try {
      setIsReturning(true);
      setError('');

      const response = await fetch('/api/vehicle-return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onReturnSuccess(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleReturn}
        disabled={isReturning}
      >
        {isReturning ? 'Mengembalikan...' : 'Kembalikan Kendaraan'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}
```

## CheckOut Component Integration

The CheckOut component now supports interactive vehicle return:

```jsx
import CheckOut from '@/components/CheckOut';

function Dashboard() {
  const [userStatus, setUserStatus] = useState(null);

  const handleVehicleReturnSuccess = () => {
    // Refresh user status after successful return
    fetchUserStatus();
  };

  return (
    <div>
      {/* For current usage */}
      {userStatus?.isUsingVehicle && userStatus?.currentUsage && (
        <CheckOut 
          type="inrange" 
          vehicleInfo={{
            requestId: userStatus.currentUsage.id,
            vehicleName: userStatus.currentUsage.vehicleName,
            vehiclePlate: userStatus.currentUsage.vehiclePlate,
            destination: userStatus.currentUsage.destination,
          }}
          onReturnSuccess={handleVehicleReturnSuccess}
        />
      )}

      {/* For overdue usage */}
      {userStatus?.isOverlapping && userStatus?.overdueUsage && (
        <CheckOut 
          type="outrange" 
          vehicleInfo={{
            requestId: userStatus.overdueUsage.id,
            vehicleName: userStatus.overdueUsage.vehicleName,
            vehiclePlate: userStatus.overdueUsage.vehiclePlate,
            destination: userStatus.overdueUsage.destination,
            minutesOverdue: userStatus.overdueUsage.minutesOverdue,
          }}
          onReturnSuccess={handleVehicleReturnSuccess}
        />
      )}
    </div>
  );
}
```

## CheckOut Component Props

```typescript
interface VehicleUsageInfo {
  requestId: string;        // Required for API call
  vehicleName: string;      // Display name
  vehiclePlate: string;     // Display plate number
  destination: string;      // Display destination
  minutesOverdue?: number;  // Show overdue time (for outrange type)
}

interface CheckOutProps {
  type: "inrange" | "outrange";     // Visual styling
  vehicleInfo?: VehicleUsageInfo;   // Vehicle information
  onReturnSuccess?: () => void;     // Callback after successful return
}
```

## Database Changes

The API performs the following database update:

```sql
UPDATE vehicle_requests 
SET 
  status = 'COMPLETED',
  check_out_at = NOW()
WHERE 
  id = ? 
  AND user_id = ? 
  AND status = 'APPROVED' 
  AND check_out_at IS NULL
```

## Security Features

1. **Authentication Required**: Must be logged in
2. **Ownership Verification**: Users can only return their own vehicles
3. **Status Validation**: Only APPROVED requests can be returned
4. **Duplicate Prevention**: Prevents returning already returned vehicles
5. **Input Validation**: Validates request ID format

## Error Handling Best Practices

```javascript
const handleVehicleReturn = async (requestId) => {
  try {
    setIsReturning(true);
    setError('');

    const response = await fetch('/api/vehicle-return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      switch (response.status) {
        case 401:
          // Redirect to login
          router.push('/login');
          break;
        case 403:
          setError('Akses ditolak');
          break;
        case 404:
          setError('Pengajuan tidak ditemukan');
          break;
        case 400:
          setError(errorData.error);
          break;
        default:
          setError('Terjadi kesalahan server');
      }
      return;
    }

    const data = await response.json();
    
    // Show success message
    setSuccess(data.message);
    
    // Refresh parent data
    if (onReturnSuccess) {
      onReturnSuccess();
    }

  } catch (error) {
    console.error('Network error:', error);
    setError('Terjadi kesalahan jaringan');
  } finally {
    setIsReturning(false);
  }
};
```

## Integration Flow

1. **User Status Check**: Dashboard fetches current vehicle status
2. **Display CheckOut**: Shows return button if user has active usage
3. **Button Click**: User clicks "Kembalikan Kendaraan"
4. **API Call**: Component calls `/api/vehicle-return`
5. **Database Update**: Status → COMPLETED, check_out_at → current time
6. **Success Feedback**: Shows success toast and refreshes status
7. **UI Update**: CheckOut component disappears (no longer using vehicle)

## Performance Notes

- Uses indexed queries on `id`, `user_id`, and `status`
- Single database transaction ensures consistency
- Immediate UI feedback with loading states
- Automatic status refresh after successful return

## Use Cases

1. **Normal Return**: User completes trip and returns vehicle on time
2. **Overdue Return**: User returns vehicle after scheduled end time
3. **Admin Override**: Administrators can manually mark returns
4. **Bulk Operations**: Process multiple returns (future enhancement)
5. **Audit Trail**: Track all vehicle usage history
