import React from 'react'

function YoutubeVideoPlayer({videoUrl, markAsComplete, hasCompleted, isMarkingComplete}: 
  {videoUrl: string, markAsComplete: () => void, hasCompleted: boolean, isMarkingComplete: boolean} ) {
  return (
          <div className="w-full aspect-video bg-black">
        <iframe
          width="100%" height="100%"
          src={videoUrl}
          title="Course Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>

      <div className="absolute top-4 right-4 z-20">
          <button
            onClick={markAsComplete}
            disabled={hasCompleted || isMarkingComplete}
            className={`px-4 py-2 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 ${
              hasCompleted 
                ? "bg-green-500 text-white cursor-default" 
                : "bg-white/90 hover:bg-white text-black active:scale-95"
            }`}
          >
            {hasCompleted ? (
              <>Completed ✓</>
            ) : (
              <>{isMarkingComplete ? "Processing..." : "Mark as Completed"}</>
            )}
          </button>
        </div>
      </div>
  )
}

export default YoutubeVideoPlayer