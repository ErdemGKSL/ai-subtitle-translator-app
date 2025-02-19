export function send(channel: string, ...data: any[]) {
  //@ts-ignore
  window.app.send(channel, ...data);
}

export function sendWait(channel: string, ...data: any[]): Promise<any[]> {
  return new Promise((resolve) => {
    let id = Math.random().toString(36).substring(7);
    //@ts-ignore
    window.app.send(channel, id, ...data);
    //@ts-ignore
    window.app.once(id, (...data: any[]) => {
      resolve(data);
    });
  });
}

export function on(channel: string, callback: (...data: any[]) => void) {
  //@ts-ignore
  window.app.on(channel, callback);
}