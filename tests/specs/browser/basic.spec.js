describe('Basic Browser Test', () => {
    it('should open a webpage', async () => {
        await browser.url('https://www.google.com');
        await browser.pause(2000);
        
        const title = await browser.getTitle();
        console.log('Page title:', title);
        
        expect(title).toContain('Google');
    });
});
