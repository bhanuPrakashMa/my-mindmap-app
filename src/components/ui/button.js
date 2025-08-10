import React from 'react';

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button';
  return (
    <Comp
      className={`p-2 rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button };