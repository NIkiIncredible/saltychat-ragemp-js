export class VoiceClient {
    public Player: PlayerMp;
    public TeamSpeakName: string;
    public VoiceRange: number;
    public PhoneSpeaker: boolean;
    public RadioSpeaker: boolean;

    constructor(player: PlayerMp, teamSpeakName: string, voiceRange: number) {
        this.Player = player;
        this.TeamSpeakName = teamSpeakName;
        this.VoiceRange = voiceRange;
    }
}
