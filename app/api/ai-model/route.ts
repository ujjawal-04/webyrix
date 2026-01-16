import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemma-3n-e2b-it:free",
        messages,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "My Next.js App",
        },
        responseType: "stream",
      }
    );

    const stream = response.data;

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let isClosed = false;
        let buffer = ''; // Buffer for incomplete chunks

        const closeController = () => {
          if (!isClosed) {
            isClosed = true;
            controller.close();
          }
        };

        stream.on("data", (chunk: any) => {
          if (isClosed) return;

          // Add chunk to buffer
          buffer += chunk.toString();
          
          // Split by double newline (SSE message separator)
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine === '') continue;
            
            if (trimmedLine.includes('[DONE]')) {
              closeController();
              return;
            }

            if (trimmedLine.startsWith('data:')) {
              const jsonStr = trimmedLine.replace(/^data:\s*/, '');
              
              // Skip empty data lines
              if (!jsonStr || jsonStr === '[DONE]') continue;
              
              try {
                const data = JSON.parse(jsonStr);
                const text = data.choices[0]?.delta?.content;
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch (err) {
                // Only log if it's not just an incomplete chunk
                if (!jsonStr.includes('{') || jsonStr.includes('}')) {
                  console.error("Error parsing stream:", err);
                }
              }
            }
          }
        });

        stream.on("end", () => {
          closeController();
        });

        stream.on("error", (err: any) => {
          console.error("Stream error", err);
          if (!isClosed) {
            isClosed = true;
            controller.error(err);
          }
        });
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}