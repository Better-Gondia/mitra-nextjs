type AlertTypes = "info" | "info2" | "warning" | "error" | "success";

interface AlertProps {
  type: AlertTypes;
  className?: string;
  boldText?: string;
  children?: React.ReactNode;
}

const getAlertByType = (
  type: AlertTypes,
  className?: string,
  boldText?: string,
  children?: React.ReactNode
) => {
  const baseClasses = "flex items-center p-2.5 text-sm rounded-lg";
  const combinedClasses = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  switch (type) {
    case "info":
      return (
        <div
          className={`${combinedClasses} text-blue-800 border border-blue-300 bg-blue-50`}
          role="alert"
        >
          <svg
            className="shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>

          <div>
            {boldText && <span className="font-medium">{boldText}</span>}{" "}
            {children || "Change a few things up and try submitting again."}
          </div>
        </div>
      );
    case "error":
      return (
        <div
          className={`${combinedClasses} text-red-800 border border-red-300 bg-red-50`}
          role="alert"
        >
          <svg
            className="shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>

          <div>
            {boldText && <span className="font-medium">{boldText}</span>}{" "}
            {children || "Change a few things up and try submitting again."}
          </div>
        </div>
      );
    case "success":
      return (
        <div
          className={`${combinedClasses} text-green-800 border border-green-300 bg-green-50`}
          role="alert"
        >
          <svg
            className="shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>

          <div>
            {boldText && <span className="font-medium">{boldText}</span>}{" "}
            {children || "Change a few things up and try submitting again."}
          </div>
        </div>
      );
    case "warning":
      return (
        <div
          className={`${combinedClasses} text-yellow-800 border border-yellow-300 bg-yellow-50`}
          role="alert"
        >
          <svg
            className="shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>

          <div>
            {boldText && <span className="font-medium">{boldText}</span>}{" "}
            {children || "Change a few things up and try submitting again."}
          </div>
        </div>
      );
    case "info2":
    default:
      return (
        <div
          className={`${combinedClasses} text-gray-800 border border-gray-300 bg-gray-50`}
          role="alert"
        >
          <svg
            className="shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>

          <div>
            {boldText && <span className="font-medium">{boldText}</span>}{" "}
            {children || "Change a few things up and try submitting again."}
          </div>
        </div>
      );
  }
};

export const Alert = ({ type, className, boldText, children }: AlertProps) => {
  return getAlertByType(type, className, boldText, children);
};
