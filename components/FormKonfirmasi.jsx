"use client";

export default function FormKonfirmasi({ action, pesan, children, className }) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(pesan)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
