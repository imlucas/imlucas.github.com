package main

import (
     "net/http"
     "fmt"
)

// [{http://www.tumblr.com/audio_file/someonesinthewolf/8755310631/tumblr_lpkxbfQrNr1qbpu1l false}
// {http://www.tumblr.com/audio_file/someonesinthewolf/8755310631/tumblr_lpkxbfQrNr1qbpu1l?plead=please-dont-download-this-or-our-lawyers-wont-let-us-host-audio true}]
// real    0m0.139s
// user    0m0.011s
// sys 0m0.008s

type UrlMap struct {
    Url string
    Exists bool
}

func loadUrls() []string {
    // file_in, _ := ioutil.ReadFile("urls.txt")
    // txt := string(file_in)
    // return strings.Split(strings.TrimSpace(txt), "\n")
    return []string {"http://www.tumblr.com/audio_file/someonesinthewolf/8755310631/tumblr_lpkxbfQrNr1qbpu1l?plead=please-dont-download-this-or-our-lawyers-wont-let-us-host-audio", "http://www.tumblr.com/audio_file/someonesinthewolf/8755310631/tumblr_lpkxbfQrNr1qbpu1l"}
}

func check(returnChannel chan UrlMap, url string) {
    resp, _ := http.Head(url)
    exists := resp.StatusCode == 200

    returnChannel <- UrlMap{url, exists}
}

func wait(responseChannel chan UrlMap, numberOfUrls int) (mapping []UrlMap) {
   done := 0

   for {
        mapping = append(mapping, <- responseChannel)
        done++

        if done >= numberOfUrls {
            break
        }
    }
    return
}

func main() {
    urls := loadUrls()

    responseChannel := make(chan UrlMap)

    for _, url := range urls {
        go check(responseChannel, url)
    }

    mapping := wait(responseChannel, len(urls))

    fmt.Println(mapping)
}
