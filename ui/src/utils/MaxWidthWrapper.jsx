const MaxWidthWrapper = ({ className, children }) => {
  return (
    <div className={`mx-auto w-full max-w-[1150px]  ${className}`}>
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
