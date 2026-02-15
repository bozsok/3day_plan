async function main() {
    try {
        console.log('Testing DELETE /api/progress...');
        const res = await fetch('http://localhost:3001/api/progress?action=clear&userId=2', { method: 'DELETE' });
        console.log('Status:', res.status);
        console.log('Response:', await res.text());
    } catch (e) {
        console.error('Fetch error:', e);
    }
}
main();
