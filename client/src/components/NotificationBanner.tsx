import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useVoting } from "@/context/VotingContext";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function NotificationBanner() {
  const { notification } = useVoting();

  if (!notification.show) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <Loader className="h-5 w-5 text-amber-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return "bg-green-100 border-l-4 border-green-500 text-green-700";
      case 'error':
        return "bg-red-100 border-l-4 border-red-500 text-red-700";
      case 'loading':
        return "bg-amber-100 border-l-4 border-amber-500 text-amber-700";
      default:
        return "bg-blue-100 border-l-4 border-blue-500 text-blue-700";
    }
  };

  const getTitle = () => {
    switch (notification.type) {
      case 'success':
        return "Success!";
      case 'error':
        return "Error";
      case 'loading':
        return "Processing";
      default:
        return "Notification";
    }
  };

  return (
    <div className="mb-8">
      <Alert className={`shadow-md ${getBgColor()}`}>
        <div className="flex items-center">
          {getIcon()}
          <div className="ml-3">
            <AlertTitle>{getTitle()}</AlertTitle>
            <AlertDescription className="text-sm">
              {notification.message}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}
