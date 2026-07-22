const Input = ({ type = 'text', placeholder, value, onChange, name }) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm
                 focus:outline-none focus:border-muted transition-colors
                 placeholder:text-muted"
    />
  );
};

export default Input;