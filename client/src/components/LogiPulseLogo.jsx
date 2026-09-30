import React from "react";

/**
 * LogiPulse Brand Mark - Exactly matches the favicon.svg mark.
 * Vibrant Sky Blue squircle with express delivery truck, white lightning bolt,
 * and aerodynamic motion lines.
 */
export const LogiPulseIcon = ({ className = "h-8 w-8", onBlue = false }) => {
  if (onBlue) {
    return (
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Crisp White Squircle for Blue Backgrounds */}
        <rect width="40" height="40" rx="10" fill="#FFFFFF" />

        {/* Delivery Vehicle Body in Vibrant Blue */}
        <path
          d="M8.5 13C8.5 12.17 9.17 11.5 10 11.5H23V25.5H10C9.17 25.5 8.5 24.83 8.5 24V13Z"
          fill="#1D70EC"
        />
        <path
          d="M23 14.5H28.2C28.8 14.5 29.35 14.85 29.6 15.4L32.2 20.8C32.4 21.2 32.5 21.65 32.5 22.1V24.5C32.5 25.05 32.05 25.5 31.5 25.5H23V14.5Z"
          fill="#1D70EC"
        />

        {/* Windshield */}
        <path
          d="M24.5 16H27.7C28.1 16 28.45 16.2 28.6 16.55L30.5 20.5H24.5V16Z"
          fill="#FFFFFF"
        />

        {/* Express Speed Lightning Bolt */}
        <path
          d="M17 13.5L12 19H16L14 24L20 18H16L18 13.5H17Z"
          fill="#FFB800"
        />

        {/* Wheels */}
        <circle cx="14" cy="26" r="3.2" fill="#0F172A" />
        <circle cx="14" cy="26" r="1.3" fill="#FFFFFF" />

        <circle cx="27.5" cy="26" r="3.2" fill="#0F172A" />
        <circle cx="27.5" cy="26" r="1.3" fill="#FFFFFF" />

        {/* Motion Speed Lines */}
        <rect x="5.5" y="16.5" width="2" height="1.4" rx="0.7" fill="#1D70EC" />
        <rect x="4" y="19.5" width="3.2" height="1.4" rx="0.7" fill="#1D70EC" />
        <rect x="5.5" y="22.5" width="2" height="1.4" rx="0.7" fill="#1D70EC" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Clean Sky Blue Rounded Squircle Matching Favicon */}
      <rect width="40" height="40" rx="10" fill="#2F80ED" />

      {/* Delivery Vehicle Body */}
      <path
        d="M8.5 13C8.5 12.17 9.17 11.5 10 11.5H23V25.5H10C9.17 25.5 8.5 24.83 8.5 24V13Z"
        fill="#0F172A"
      />
      <path
        d="M23 14.5H28.2C28.8 14.5 29.35 14.85 29.6 15.4L32.2 20.8C32.4 21.2 32.5 21.65 32.5 22.1V24.5C32.5 25.05 32.05 25.5 31.5 25.5H23V14.5Z"
        fill="#0F172A"
      />

      {/* Windshield */}
      <path
        d="M24.5 16H27.7C28.1 16 28.45 16.2 28.6 16.55L30.5 20.5H24.5V16Z"
        fill="#FFFFFF"
      />

      {/* Express Speed Lightning Bolt on Cargo Container */}
      <path
        d="M17 13.5L12 19H16L14 24L20 18H16L18 13.5H17Z"
        fill="#FFFFFF"
      />

      {/* Heavy-Duty Wheels */}
      <circle cx="14" cy="26" r="3.2" fill="#0F172A" />
      <circle cx="14" cy="26" r="1.3" fill="#FFFFFF" />

      <circle cx="27.5" cy="26" r="3.2" fill="#0F172A" />
      <circle cx="27.5" cy="26" r="1.3" fill="#FFFFFF" />

      {/* Motion Speed Lines */}
      <rect x="5.5" y="16.5" width="2" height="1.4" rx="0.7" fill="#0F172A" />
      <rect x="4" y="19.5" width="3.2" height="1.4" rx="0.7" fill="#0F172A" />
      <rect x="5.5" y="22.5" width="2" height="1.4" rx="0.7" fill="#0F172A" />
    </svg>
  );
};

export const LogiPulseLogo = ({
  size = "md",
  withText = true,
  variant = "default", // "default" | "on-blue"
  subtitle = "Fleet Telemetry & Dispatch",
  className = "",
}) => {
  const sizeMap = {
    sm: {
      box: "h-8 w-8",
      icon: "h-8 w-8",
      text: "text-lg",
    },
    md: {
      box: "h-10 w-10",
      icon: "h-10 w-10",
      text: "text-xl",
    },
    lg: {
      box: "h-12 w-12",
      icon: "h-12 w-12",
      text: "text-2xl",
    },
  };

  const config = sizeMap[size] || sizeMap.md;
  const isOnBlue = variant === "on-blue";

  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Brand Icon Matching Favicon Exactly */}
      <div className="shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-md shadow-sky-500/20 rounded-xl overflow-hidden">
        <LogiPulseIcon className={config.icon} onBlue={isOnBlue} />
      </div>

      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center leading-none">
            <span
              className={`font-heading ${config.text} font-black tracking-tight ${
                isOnBlue ? "text-white" : "text-foreground"
              } flex items-center`}
            >
              <span>Logi</span>
              <span className={isOnBlue ? "text-white" : "text-[#FBBC04]"}>Pulse</span>
            </span>
          </div>
          {subtitle && (
            <span
              className={`text-[10px] ${
                isOnBlue ? "text-sky-100" : "text-muted-foreground"
              } font-medium mt-1 tracking-normal`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default LogiPulseLogo;
