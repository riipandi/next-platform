export default function Loader() {
  return (
    <div className='w-full my-10'>
      <div className='h-10 mx-auto bg-gray-200 w-60 animate-pulse md:rounded-md' />
      <div className='w-full max-w-screen-xl mx-auto my-12 md:w-3/4'>
        <div className='w-full mx-auto bg-gray-200 h-80 sm:h-150 animate-pulse md:rounded-xl' />
        <div className='flex flex-col w-5/6 mx-auto mt-10 space-y-4 md:w-full'>
          <div className='w-48 h-20 bg-gray-200 rounded-md animate-pulse' />
          <div className='h-12 bg-gray-200 rounded-md w-96 animate-pulse' />
          <div className='h-12 bg-gray-200 rounded-md w-80 animate-pulse' />
        </div>
      </div>
    </div>
  );
}
