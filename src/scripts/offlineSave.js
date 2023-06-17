import PouchDB from 'pouchdb-browser';

import shell from './shell';

const db = new PouchDB('offline_videos');

export async function offlineSave(apiclient, items) {
    if (!shell.downloadFiles(items)) {
        for (const item of items) {
            const response = await apiclient.get(item.url);

            const reader = response.body.getReader();
            const contentLength = +response.headers.get('Content-Length');
            let receivedLength = 0; // received that many bytes at the moment
            const chunks = []; // array of received binary chunks (comprises the body)
            const TRUE = true;
            while (TRUE) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                chunks.push(value);
                receivedLength += value.length;

                console.log(`Received ${receivedLength} of ${contentLength} : ${(receivedLength / contentLength) * 100}`);
            }

            const chunksAll = new Uint8Array(receivedLength); // (4.1)
            let position = 0;
            for (const chunk of chunks) {
                chunksAll.set(chunk, position); // (4.2)
                position += chunk.length;
            }

            const objectRow = {
                ...item,
                _id: item.itemId,
                '_attachments': {
                    'video': {
                        'content_type': response.headers.get('Content-Type'),
                        'data': new Blob([chunksAll])
                    }
                }
            };
            await db.put(objectRow);
        }
    }
}
