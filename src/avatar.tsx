import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function Avatar() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  useEffect(() => {
    const script = document.createElement("script");
    script.text = `!function(window){const host="https://labs.heygen.com",url=host+"/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJCcnlhbl9JVF9TaXR0aW5nX3B1YmxpYyIs%0D%0AInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzLzMzYzlhYzRh%0D%0AZWFkNDRkZmM4YmMwMDgyYTM1MDYyYTcwXzQ1NTgwL3ByZXZpZXdfdGFsa18zLndlYnAiLCJuZWVk%0D%0AUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6ImRlbW8tMSIsInVzZXJu%0D%0AYW1lIjoiZWM2YWY2Y2I2M2Q2NDljMWJkMThjM2JlYWVkNTNmMmYifQ%3D%3D&inIFrame=1",clientWidth=document.body.clientWidth,wrapDiv=document.createElement("div");wrapDiv.id="heygen-streaming-embed";const container=document.createElement("div");container.id="heygen-streaming-container";const stylesheet=document.createElement("style");stylesheet.innerHTML=\`
  #heygen-streaming-embed {
    z-index: 9999;
    position: fixed;
    left: 40px;
    bottom: 40px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.12);
    transition: all linear 0.1s;
    overflow: hidden;

    opacity: 0;
    visibility: hidden;
  }
  #heygen-streaming-embed.show {
    opacity: 1;
    visibility: visible;
  }
  #heygen-streaming-embed.expand {
    \${clientWidth<540?"height: 266px; width: 96%; left: 50%; transform: translateX(-50%);":"height: 366px; width: calc(366px * 16 / 9);"}
    border: 0;
    border-radius: 8px;
  }
  #heygen-streaming-container {
    width: 100%;
    height: 100%;
  }
  #heygen-streaming-container iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
  \`;const iframe=document.createElement("iframe");iframe.allowFullscreen=!1,iframe.title="Streaming Embed",iframe.role="dialog",iframe.allow="microphone",iframe.src=url;let visible=!1,initial=!1;window.addEventListener("message",(e=>{e.origin===host&&e.data&&e.data.type&&"streaming-embed"===e.data.type&&("init"===e.data.action?(initial=!0,wrapDiv.classList.toggle("show",initial)):"show"===e.data.action?(visible=!0,wrapDiv.classList.toggle("expand",visible)):"hide"===e.data.action&&(visible=!1,wrapDiv.classList.toggle("expand",visible)))})),container.appendChild(iframe),wrapDiv.appendChild(stylesheet),wrapDiv.appendChild(container),document.body.appendChild(wrapDiv)}(globalThis);`;
    document.body.appendChild(script);

    window.addEventListener("message", async (e) => {
      const isHeyGen = e.origin.includes("heygen.com");

      if (!isHeyGen || !e.data || e.data.type !== "streaming-embed") return;

      if (e.data.action === "show") {
        // Stream started
        const startTime = new Date();
        startTimeRef.current = startTime;

        const { data, error } = await supabase
          .from("session_timing")
          .insert({ start_time: startTime })
          .select()
          .single();

        if (error) console.error("Failed to store start time:", error);
        else setSessionId(data.id);
      }

      if (e.data.action === "hide") {
        // Stream ended
        const endTime = new Date();
        if (startTimeRef.current && sessionId) {
          const duration = endTime.getTime() - startTimeRef.current.getTime();

          const { error } = await supabase
            .from("session_timing")
            .update({
              end_time: endTime,
              duration: duration,
            })
            .eq("id", sessionId);

          if (error) console.error("Failed to store end time:", error);
        }
      }
    });

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // nothing visible needed
}

// Export both as default and named export to satisfy both import styles
export const AvatarEmbed = Avatar;
export default Avatar;
