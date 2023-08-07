describe('Feature: posting a message',()=>{
    describe('Rule: a message can contain a maximum of 280 characters',()=>{
        test("Alice can post a message on her timeline", ()=>{
            givenNowIs(new Date("2023-01-19T19:00:00.000Z"))
            whenUserPostsAMessage({
                id:"message-id",
                text:"Hello World",
                author:"Alice"
            })
            thenPostedMessageShouldBe({
                id:"message-id",
                text:"Hello World",
                author:"Alice",
                publishedAt:new Date("2023-01-19T19:00:00.000Z")
            })
        })
    }
    )
})

let message : {
    id:string;
    text:string
    author:string,
    publishedAt:Date
}

let now:Date

function givenNowIs(_now:Date)
{
    now =  _now
}

function whenUserPostsAMessage(postMessageCommand:{id:string, text:string, author:string})
{
    message = {id:postMessageCommand.id,
         text:postMessageCommand.text,
          author:postMessageCommand.author,
           publishedAt:now}
}

function thenPostedMessageShouldBe(expectedMessage:{id:string, text:string, author:string, publishedAt:Date})
{
    expect(expectedMessage).toEqual(message)
}